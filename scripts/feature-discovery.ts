import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const featureModuleSuffixes = {
  dto: ".dto.ts",
  feature: ".feature.ts",
  navigation: ".navigation.tsx",
  profileSection: ".profile-section.tsx",
  schema: ".schema.ts",
  seed: ".seed.ts",
  table: ".tables.ts",
  view: ".views.ts",
} as const;

export type FeatureModuleKind = keyof typeof featureModuleSuffixes;
export type FeatureAssetKind = FeatureModuleKind | "message";

export type FeatureModuleAsset = Readonly<{
  feature: string;
  kind: FeatureModuleKind;
  path: string;
}>;

export type FeatureMessageAsset = Readonly<{
  feature: string;
  kind: "message";
  locale: string;
  namespace: string;
  path: string;
}>;

export type FeatureAsset = FeatureMessageAsset | FeatureModuleAsset;

export type FeatureAssetIndex = Readonly<{
  features: readonly string[];
  messages: readonly FeatureMessageAsset[];
  modules: Readonly<Record<FeatureModuleKind, readonly FeatureModuleAsset[]>>;
}>;

export type FeatureDescriptor = Readonly<{
  /** Stable feature identity; must match the containing `src/feat/<id>` folder. */
  id: string;
  /** Other feature contracts this feature imports. */
  dependencies: readonly string[];
  /** Extension points supplied by this feature, such as routes or navigation. */
  contributions: readonly string[];
}>;

export type DiscoveredFeature = Readonly<{
  descriptor: FeatureDescriptor;
  path: string;
}>;

export type FeatureGraph = Readonly<{
  assets: readonly FeatureAsset[];
  features: readonly DiscoveredFeature[];
}>;

export type DiscoverFeatureAssetsOptions = Readonly<{
  featuresDirectory: string | URL;
}>;

export type SyncGeneratedDirectoryOptions = Readonly<{
  /** This directory is treated as generated-only; unlisted files are removed. */
  directory: string | URL;
  files: Readonly<Record<string, string>>;
}>;

const featureSegmentPattern = /^[a-z][a-z0-9-]*$/;
const contributionPattern = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)*$/;
const localePattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const messageDirectory = "messages";
const messageExtension = ".yaml";
const moduleKinds = Object.keys(featureModuleSuffixes) as FeatureModuleKind[];

/** Preserves literal ids and contribution names while checking the contract. */
export function defineFeature<const Descriptor extends FeatureDescriptor>(
  descriptor: Descriptor,
): Descriptor {
  return descriptor;
}

function filesystemPath(path: string | URL): string {
  return path instanceof URL ? fileURLToPath(path) : path;
}

function posixPath(path: string): string {
  return path.split(sep).join("/");
}

function comparePaths(left: FeatureAsset, right: FeatureAsset): number {
  if (left.path < right.path) return -1;
  if (left.path > right.path) return 1;
  return 0;
}

function assertFeatureSegment(segment: string, path: string): void {
  if (!featureSegmentPattern.test(segment)) {
    throw new Error(`${path} has an invalid feature path segment: ${segment}`);
  }
}

function moduleKind(path: string): FeatureModuleKind | undefined {
  return moduleKinds.find((kind) => path.endsWith(featureModuleSuffixes[kind]));
}

/**
 * Classifies a path relative to `src/feat`.
 *
 * Messages can be colocated at any feature depth:
 * `blog/posts/messages/en/editor.yaml` becomes `blog.posts.editor`.
 */
export function classifyFeatureAsset(path: string): FeatureAsset | undefined {
  const normalizedPath = path.replaceAll("\\", "/");
  const segments = normalizedPath.split("/");
  const feature = segments[0];
  if (feature === undefined || feature.length === 0) return undefined;

  const kind = moduleKind(normalizedPath);
  if (kind !== undefined) {
    for (const segment of segments.slice(0, -1)) {
      assertFeatureSegment(segment, normalizedPath);
    }
    assertFeatureSegment(feature, normalizedPath);
    return { feature, kind, path: normalizedPath };
  }

  if (!normalizedPath.endsWith(messageExtension)) return undefined;

  const messagesIndex = segments.indexOf(messageDirectory);
  if (messagesIndex < 1) return undefined;

  const locale = segments[messagesIndex + 1];
  const messagePath = segments.slice(messagesIndex + 2);
  if (
    locale === undefined ||
    !localePattern.test(locale) ||
    messagePath.length === 0
  ) {
    throw new Error(
      `${normalizedPath} must match <feature>/**/messages/<locale>/**/*.yaml`,
    );
  }

  const featurePath = segments.slice(0, messagesIndex);
  const leaf = messagePath.at(-1);
  if (leaf === undefined) return undefined;
  const namespacePath = [
    ...featurePath,
    ...messagePath.slice(0, -1),
    leaf.slice(0, -messageExtension.length),
  ];

  for (const segment of namespacePath) {
    assertFeatureSegment(segment, normalizedPath);
  }

  return {
    feature,
    kind: "message",
    locale,
    namespace: namespacePath.join("."),
    path: normalizedPath,
  };
}

function isMissingDirectory(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/** Discovers feature assets in deterministic path order with one Bun.Glob. */
export async function discoverFeatureAssets({
  featuresDirectory,
}: DiscoverFeatureAssetsOptions): Promise<FeatureAsset[]> {
  const assets: FeatureAsset[] = [];
  const glob = new Bun.Glob("**/*");

  try {
    for await (const path of glob.scan({
      cwd: filesystemPath(featuresDirectory),
      onlyFiles: true,
    })) {
      const asset = classifyFeatureAsset(path);
      if (asset !== undefined) assets.push(asset);
    }
  } catch (error) {
    if (!isMissingDirectory(error)) throw error;
  }

  assets.sort(comparePaths);
  assertUniqueMessageNamespaces(assets);
  return assets;
}

function stringArray(
  value: unknown,
  field: "contributions" | "dependencies",
  path: string,
): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new TypeError(`${path} must export a feature with a ${field} array`);
  }
  if (new Set(value).size !== value.length) {
    throw new Error(`${path} declares duplicate ${field}`);
  }
  return [...value].sort();
}

function parseFeatureDescriptor(
  value: unknown,
  path: string,
): FeatureDescriptor {
  if (typeof value !== "object" || value === null) {
    throw new TypeError(`${path} must export a feature descriptor`);
  }

  const descriptor = value as Record<string, unknown>;
  const { id } = descriptor;
  if (typeof id !== "string" || !featureSegmentPattern.test(id)) {
    throw new TypeError(`${path} has an invalid feature id`);
  }

  const dependencies = stringArray(
    descriptor.dependencies,
    "dependencies",
    path,
  );
  const contributions = stringArray(
    descriptor.contributions,
    "contributions",
    path,
  );
  for (const contribution of contributions) {
    if (!contributionPattern.test(contribution)) {
      throw new Error(`${path} has an invalid contribution: ${contribution}`);
    }
  }
  for (const dependency of dependencies) {
    if (!featureSegmentPattern.test(dependency)) {
      throw new Error(`${path} has an invalid dependency: ${dependency}`);
    }
  }

  return { contributions, dependencies, id };
}

function requiredContribution(asset: FeatureAsset): string | undefined {
  switch (asset.kind) {
    case "message":
      return "messages";
    case "schema":
    case "table":
    case "view":
      return "database";
    case "profileSection":
      return "profile.sections";
    case "seed":
      return "seeds";
    case "dto":
    case "feature":
    case "navigation":
      return undefined;
  }
}

function featureAssets(
  assets: readonly FeatureAsset[],
  feature: string,
  kind: FeatureModuleKind,
): FeatureModuleAsset[] {
  return assets.filter(
    (asset): asset is FeatureModuleAsset =>
      asset.feature === feature && asset.kind === kind,
  );
}

function validateContributionModules(
  feature: DiscoveredFeature,
  assets: readonly FeatureAsset[],
): void {
  const { contributions, id } = feature.descriptor;
  const declared = new Set(contributions);
  const navigation = featureAssets(assets, id, "navigation");
  const navigationDeclared =
    declared.has("navigation.public") || declared.has("navigation.admin");
  const expectedNavigationPath = `${id}/${id}.navigation.tsx`;

  if (
    navigationDeclared &&
    !navigation.some(({ path }) => path === expectedNavigationPath)
  ) {
    throw new Error(
      `${id} declares navigation but is missing ${expectedNavigationPath}`,
    );
  }
  for (const asset of navigation) {
    if (asset.path !== expectedNavigationPath) {
      throw new Error(
        `${asset.path} must be the root navigation module ${expectedNavigationPath}`,
      );
    }
    if (!navigationDeclared) {
      throw new Error(
        `${id} owns ${asset.path} but does not declare navigation.public or navigation.admin`,
      );
    }
  }

  const profileSections = featureAssets(assets, id, "profileSection");
  if (declared.has("profile.sections") && profileSections.length === 0) {
    throw new Error(
      `${id} declares profile.sections but owns no *.profile-section.tsx module`,
    );
  }

  const seeds = featureAssets(assets, id, "seed");
  if (declared.has("seeds") && seeds.length === 0) {
    throw new Error(`${id} declares seeds but owns no *.seed.ts module`);
  }
}

/**
 * Validates ownership, declared dependencies, cycles, and detectable
 * contributions. Framework-owned contributions such as `routes` remain
 * explicit metadata and are intentionally not inferred here.
 */
export function validateFeatureGraph(
  features: readonly DiscoveredFeature[],
  assets: readonly FeatureAsset[],
): void {
  const featureById = new Map<string, DiscoveredFeature>();
  for (const feature of features) {
    const existing = featureById.get(feature.descriptor.id);
    if (existing !== undefined) {
      throw new Error(
        `Duplicate feature id ${feature.descriptor.id}: ${existing.path}, ${feature.path}`,
      );
    }
    featureById.set(feature.descriptor.id, feature);
  }

  for (const asset of assets) {
    if (!featureById.has(asset.feature)) {
      throw new Error(
        `${asset.path} belongs to undeclared feature ${asset.feature}; add ${asset.feature}/${asset.feature}.feature.ts`,
      );
    }
  }

  for (const feature of features) {
    const { dependencies, id } = feature.descriptor;
    for (const dependency of dependencies) {
      if (!featureById.has(dependency)) {
        throw new Error(`${id} depends on undeclared feature ${dependency}`);
      }
      if (dependency === id) {
        throw new Error(`${id} cannot depend on itself`);
      }
    }

    const declared = new Set(feature.descriptor.contributions);
    for (const asset of assets) {
      if (asset.feature !== id) continue;
      const contribution = requiredContribution(asset);
      if (contribution !== undefined && !declared.has(contribution)) {
        throw new Error(
          `${id} owns ${asset.path} but does not declare the ${contribution} contribution`,
        );
      }
    }
    validateContributionModules(feature, assets);
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const stack: string[] = [];
  const visit = (id: string): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const cycleStart = stack.indexOf(id);
      throw new Error(
        `Feature dependency cycle: ${[...stack.slice(cycleStart), id].join(" -> ")}`,
      );
    }

    visiting.add(id);
    stack.push(id);
    const feature = featureById.get(id);
    if (feature === undefined) return;
    for (const dependency of feature.descriptor.dependencies) visit(dependency);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of [...featureById.keys()].sort()) visit(id);
}

/** Loads `src/feat/<id>/<id>.feature.ts` descriptors and validates the graph. */
export async function discoverFeatureGraph(
  options: DiscoverFeatureAssetsOptions,
): Promise<FeatureGraph> {
  const assets = await discoverFeatureAssets(options);
  const featuresDirectory = filesystemPath(options.featuresDirectory);
  const featureAssets = assets.filter(
    (asset): asset is FeatureModuleAsset & { kind: "feature" } =>
      asset.kind === "feature",
  );
  const features: DiscoveredFeature[] = [];

  for (const asset of featureAssets) {
    const expectedPath = `${asset.feature}/${asset.feature}.feature.ts`;
    if (asset.path !== expectedPath) {
      throw new Error(
        `${asset.path} must be the root feature manifest ${expectedPath}`,
      );
    }
    const manifestUrl = pathToFileURL(resolve(featuresDirectory, asset.path));
    const module = (await import(manifestUrl.href)) as Record<string, unknown>;
    const value = module.feature ?? module.default;
    const descriptor = parseFeatureDescriptor(value, asset.path);
    if (descriptor.id !== asset.feature) {
      throw new Error(
        `${asset.path} declares id ${descriptor.id}; expected ${asset.feature}`,
      );
    }
    features.push({ descriptor, path: asset.path });
  }

  features.sort(({ descriptor: left }, { descriptor: right }) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
  validateFeatureGraph(features, assets);
  return { assets, features };
}

function assertUniqueMessageNamespaces(assets: readonly FeatureAsset[]): void {
  const sources = new Map<string, string>();
  for (const asset of assets) {
    if (asset.kind !== "message") continue;
    const key = `${asset.locale}:${asset.namespace}`;
    const existing = sources.get(key);
    if (existing !== undefined) {
      throw new Error(
        `Duplicate feature message namespace ${key}: ${existing}, ${asset.path}`,
      );
    }
    sources.set(key, asset.path);
  }
}

/** Groups descriptors without changing their deterministic path order. */
export function indexFeatureAssets(
  assets: readonly FeatureAsset[],
): FeatureAssetIndex {
  const modules: Record<FeatureModuleKind, FeatureModuleAsset[]> = {
    dto: [],
    feature: [],
    navigation: [],
    profileSection: [],
    schema: [],
    seed: [],
    table: [],
    view: [],
  };
  const messages: FeatureMessageAsset[] = [];
  const features = new Set<string>();

  for (const asset of [...assets].sort(comparePaths)) {
    features.add(asset.feature);
    if (asset.kind === "message") messages.push(asset);
    else modules[asset.kind].push(asset);
  }

  return {
    features: [...features].sort(),
    messages,
    modules,
  };
}

function safeGeneratedPath(directory: string, path: string): string {
  if (
    path.length === 0 ||
    path.startsWith("/") ||
    path.split(/[\\/]/).includes("..")
  ) {
    throw new Error(
      `Generated file path must stay inside its directory: ${path}`,
    );
  }

  const target = resolve(directory, path);
  const relativeTarget = relative(directory, target);
  if (relativeTarget.startsWith("..") || relativeTarget === "") {
    throw new Error(
      `Generated file path must stay inside its directory: ${path}`,
    );
  }
  return target;
}

/** Atomically writes only when content changed, avoiding generator watch loops. */
export async function writeGeneratedFile(
  path: string | URL,
  source: string,
): Promise<void> {
  const outputPath = filesystemPath(path);
  try {
    if ((await readFile(outputPath, "utf8")) === source) return;
  } catch (error) {
    if (!isMissingDirectory(error)) throw error;
  }

  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = resolve(
    dirname(outputPath),
    `.${basename(outputPath)}.${process.pid}.${crypto.randomUUID()}.tmp`,
  );
  try {
    await writeFile(temporaryPath, source, "utf8");
    await rename(temporaryPath, outputPath);
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

/**
 * Synchronizes a directory that is exclusively owned by a generator.
 * Existing files absent from `files` are stale and are removed.
 */
export async function syncGeneratedDirectory({
  directory,
  files,
}: SyncGeneratedDirectoryOptions): Promise<void> {
  const directoryPath = resolve(filesystemPath(directory));
  const desiredFiles = new Map(
    Object.entries(files).map(([path, source]) => [
      posixPath(
        relative(directoryPath, safeGeneratedPath(directoryPath, path)),
      ),
      source,
    ]),
  );

  const existingFiles: string[] = [];
  const glob = new Bun.Glob("**/*");
  try {
    for await (const path of glob.scan({
      cwd: directoryPath,
      onlyFiles: true,
    })) {
      existingFiles.push(path.replaceAll("\\", "/"));
    }
  } catch (error) {
    if (!isMissingDirectory(error)) throw error;
  }

  for (const path of existingFiles.sort()) {
    if (!desiredFiles.has(path)) {
      await unlink(safeGeneratedPath(directoryPath, path));
    }
  }

  for (const [path, source] of [...desiredFiles].sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  )) {
    await writeGeneratedFile(safeGeneratedPath(directoryPath, path), source);
  }
}

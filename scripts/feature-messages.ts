import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { dset } from "dset";
import { flatten } from "flat";
import { IntlMessageFormat } from "intl-messageformat";
import { z } from "zod";

import type { FeatureAsset, FeatureMessageAsset } from "./feature-discovery";

export type ParsedFeatureMessages = Readonly<{
  messages: Record<string, unknown>;
  metadata: FeatureMessageMetadata;
}>;

export type BuildFeatureMessagesOptions = Readonly<{
  appMessagesDirectory?: string | URL;
  assets: readonly FeatureAsset[];
  featuresDirectory: string | URL;
}>;

export type AppMessageAsset = Readonly<{
  kind: "app-message";
  locale: string;
  namespace: string;
  path: string;
}>;

type CatalogMessageAsset = Readonly<{
  directory: string;
  locale: string;
  namespace: string;
  owner: "app" | `feature:${string}`;
  path: string;
}>;

const messagesSchema = z.record(z.string(), z.unknown());
const messageExampleSchema = z
  .object({
    expected: z.string(),
    values: z.record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    ),
  })
  .strict();
const metadataSchema = z
  .object({
    description: z.string().min(1),
    examples: z.record(z.string(), messageExampleSchema).optional(),
    generated: z.literal(true),
  })
  .strict();

const localePattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const namespaceSegmentPattern = /^[a-z][a-z0-9-]*$/;

export type FeatureMessageMetadata = Readonly<z.infer<typeof metadataSchema>>;

function filesystemPath(path: string | URL): string {
  return path instanceof URL ? fileURLToPath(path) : path;
}

function isMissingDirectory(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/** Classifies a path relative to `src/app/messages`. */
export function classifyAppMessageAsset(
  path: string,
): AppMessageAsset | undefined {
  const normalizedPath = path.replaceAll("\\", "/");
  if (!normalizedPath.endsWith(".yaml")) return undefined;

  const [locale, ...messagePath] = normalizedPath.split("/");
  const leaf = messagePath.at(-1);
  if (
    locale === undefined ||
    !localePattern.test(locale) ||
    leaf === undefined ||
    messagePath.length === 0
  ) {
    throw new Error(
      `${normalizedPath} must match <locale>/**/*.yaml under app messages`,
    );
  }

  const namespacePath = [
    ...messagePath.slice(0, -1),
    leaf.slice(0, -".yaml".length),
  ];
  for (const segment of namespacePath) {
    if (!namespaceSegmentPattern.test(segment)) {
      throw new Error(
        `${normalizedPath} has an invalid message namespace segment: ${segment}`,
      );
    }
  }

  return {
    kind: "app-message",
    locale,
    namespace: namespacePath.join("."),
    path: normalizedPath,
  };
}

/** Discovers app-shell messages without making them feature contributions. */
export async function discoverAppMessageAssets(
  appMessagesDirectory: string | URL,
): Promise<AppMessageAsset[]> {
  const assets: AppMessageAsset[] = [];
  const glob = new Bun.Glob("**/*.yaml");

  try {
    for await (const path of glob.scan({
      cwd: filesystemPath(appMessagesDirectory),
      onlyFiles: true,
    })) {
      const asset = classifyAppMessageAsset(path);
      if (asset !== undefined) assets.push(asset);
    }
  } catch (error) {
    if (!isMissingDirectory(error)) throw error;
  }

  return assets.sort(({ path: left }, { path: right }) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
}

/** Parses metadata front matter followed by one namespace-local YAML map. */
export function parseFeatureMessageFile(
  filename: string,
  source: string,
): ParsedFeatureMessages {
  const documents = Bun.YAML.parse(source);
  if (!Array.isArray(documents) || documents.length !== 2) {
    throw new Error(
      `${filename} must contain metadata front matter followed by one message document`,
    );
  }

  return {
    messages: messagesSchema.parse(documents[1]),
    metadata: metadataSchema.parse(documents[0]),
  };
}

function messageKeys(messages: Record<string, unknown>): string[] {
  return Object.keys(
    flatten<Record<string, unknown>, Record<string, unknown>>(messages, {
      safe: true,
    }),
  ).sort();
}

function flattenMessageStrings(
  messages: Record<string, unknown>,
  filename: string,
): Record<string, string> {
  const flattened = flatten<Record<string, unknown>, Record<string, unknown>>(
    messages,
    { safe: true },
  );
  for (const [key, value] of Object.entries(flattened)) {
    if (typeof value !== "string") {
      throw new TypeError(
        `${filename}:${key} must be an ICU MessageFormat string`,
      );
    }
  }
  return flattened as Record<string, string>;
}

/** Compiles ICU and executes front-matter examples before publishing JSON. */
export function validateFeatureMessageExamples(
  locale: string,
  namespace: string,
  filename: string,
  parsed: ParsedFeatureMessages,
): void {
  const messages = flattenMessageStrings(parsed.messages, filename);
  const formats = new Map<string, IntlMessageFormat>();
  for (const [key, message] of Object.entries(messages)) {
    try {
      formats.set(key, new IntlMessageFormat(message, locale));
    } catch (error) {
      throw new Error(`${locale}:${namespace}.${key} is invalid ICU`, {
        cause: error,
      });
    }
  }

  for (const [key, example] of Object.entries(parsed.metadata.examples ?? {})) {
    const format = formats.get(key);
    if (format === undefined) {
      throw new Error(
        `${filename} example ${key} does not reference a message in that file`,
      );
    }
    const received = format.format(example.values);
    if (received !== example.expected) {
      throw new Error(
        `${locale}:${namespace}.${key} rendered ${JSON.stringify(received)}; expected ${JSON.stringify(example.expected)}`,
      );
    }
  }
}

/** Requires every generated locale to expose the same nested message leaves. */
export function validateFeatureMessageParity(
  catalogs: Readonly<Record<string, Record<string, unknown>>>,
): void {
  const entries = Object.entries(catalogs).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  const reference = entries[0];
  if (reference === undefined) return;
  const [referenceLocale, referenceMessages] = reference;
  const expectedKeys = messageKeys(referenceMessages);

  for (const [locale, messages] of entries.slice(1)) {
    const keys = messageKeys(messages);
    if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
      throw new Error(
        `${locale} message keys do not match ${referenceLocale}: ${JSON.stringify(keys)}`,
      );
    }
  }
}

function namespacesOverlap(left: string, right: string): boolean {
  return (
    left === right ||
    left.startsWith(`${right}.`) ||
    right.startsWith(`${left}.`)
  );
}

function assertNoNamespaceCollisions(
  messages: readonly CatalogMessageAsset[],
): void {
  const byLocale = Map.groupBy(messages, ({ locale }) => locale);
  for (const [locale, assets] of byLocale) {
    const sorted = [...assets].sort((left, right) =>
      left.namespace < right.namespace
        ? -1
        : left.namespace > right.namespace
          ? 1
          : left.path < right.path
            ? -1
            : left.path > right.path
              ? 1
              : 0,
    );
    for (const [index, asset] of sorted.entries()) {
      const next = sorted[index + 1];
      if (
        next !== undefined &&
        namespacesOverlap(asset.namespace, next.namespace)
      ) {
        throw new Error(
          `${locale} message namespace ${asset.namespace} from ${asset.path} overlaps ${next.namespace} from ${next.path}`,
        );
      }
    }
  }

  const appNamespaces = [
    ...new Set(
      messages
        .filter(({ owner }) => owner === "app")
        .map(({ namespace }) => namespace),
    ),
  ].sort();
  const featureNamespaces = [
    ...new Set(
      messages
        .filter(({ owner }) => owner !== "app")
        .map(({ namespace }) => namespace),
    ),
  ].sort();
  for (const appNamespace of appNamespaces) {
    for (const featureNamespace of featureNamespaces) {
      if (namespacesOverlap(appNamespace, featureNamespace)) {
        throw new Error(
          `App message namespace ${appNamespace} overlaps feature message namespace ${featureNamespace}`,
        );
      }
    }
  }
}

/** Loads feature and app YAML into one validated locale catalog. */
export async function loadFeatureMessageCatalogs({
  appMessagesDirectory,
  assets,
  featuresDirectory,
}: BuildFeatureMessagesOptions): Promise<
  Record<string, Record<string, unknown>>
> {
  const featureDirectory = filesystemPath(featuresDirectory);
  const featureMessageAssets: CatalogMessageAsset[] = assets
    .filter((asset): asset is FeatureMessageAsset => asset.kind === "message")
    .map((asset) => ({
      directory: featureDirectory,
      locale: asset.locale,
      namespace: asset.namespace,
      owner: `feature:${asset.feature}`,
      path: asset.path,
    }));
  const appMessageAssets: CatalogMessageAsset[] =
    appMessagesDirectory === undefined
      ? []
      : (await discoverAppMessageAssets(appMessagesDirectory)).map((asset) => ({
          directory: filesystemPath(appMessagesDirectory),
          locale: asset.locale,
          namespace: asset.namespace,
          owner: "app",
          path: asset.path,
        }));
  const messageAssets = [...appMessageAssets, ...featureMessageAssets].sort(
    (left, right) =>
      left.locale < right.locale
        ? -1
        : left.locale > right.locale
          ? 1
          : left.namespace < right.namespace
            ? -1
            : left.namespace > right.namespace
              ? 1
              : left.path < right.path
                ? -1
                : left.path > right.path
                  ? 1
                  : 0,
  );
  assertNoNamespaceCollisions(messageAssets);

  const catalogs: Record<string, Record<string, unknown>> = {};
  for (const asset of messageAssets) {
    const source = await readFile(resolve(asset.directory, asset.path), "utf8");
    const parsed = parseFeatureMessageFile(asset.path, source);
    validateFeatureMessageExamples(
      asset.locale,
      asset.namespace,
      asset.path,
      parsed,
    );
    const catalog = catalogs[asset.locale] ?? {};
    catalogs[asset.locale] = catalog;
    dset(catalog, asset.namespace, parsed.messages);
  }

  validateFeatureMessageParity(catalogs);
  return catalogs;
}

export function renderFeatureMessagesJson(
  messages: Record<string, unknown>,
): string {
  const flattened = flattenMessageStrings(messages, "generated messages");
  const sorted = Object.fromEntries(
    Object.entries(flattened).sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    ),
  );
  return `${JSON.stringify(sorted, null, 2)}\n`;
}

/** Returns files ready for `syncGeneratedDirectory({ directory: messages })`. */
export async function buildFeatureMessageFiles(
  options: BuildFeatureMessagesOptions,
): Promise<Record<string, string>> {
  const catalogs = await loadFeatureMessageCatalogs(options);
  return Object.fromEntries(
    Object.entries(catalogs)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([locale, messages]) => [
        `${locale}.json`,
        renderFeatureMessagesJson(messages),
      ]),
  );
}

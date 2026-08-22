import { fileURLToPath } from "node:url";

import { compileMessageFiles, type MessageAsset } from "@teyfix/paraglide-yaml";

import type { FeatureAsset, FeatureMessageAsset } from "./feature-discovery";

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

const localePattern = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const namespaceSegmentPattern = /^[a-z][a-z0-9-]*$/;

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

/** Discovers application-shell messages without making them feature assets. */
export async function discoverAppMessageAssets(
  appMessagesDirectory: string | URL,
): Promise<AppMessageAsset[]> {
  const assets: AppMessageAsset[] = [];
  const glob = new Bun.Glob("**/*.yaml");

  try {
    for await (const path of glob.scan({
      cwd: filesystemPath(appMessagesDirectory),
      onlyFiles: true,
      throwErrorOnBrokenSymlink: true,
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

/** Adapts application and feature discovery to the shared catalog compiler. */
export async function buildFeatureMessageFiles({
  appMessagesDirectory,
  assets,
  featuresDirectory,
}: BuildFeatureMessagesOptions): Promise<Record<string, string>> {
  const featureAssets: MessageAsset[] = assets
    .filter((asset): asset is FeatureMessageAsset => asset.kind === "message")
    .map((asset) => ({
      directory: featuresDirectory,
      locale: asset.locale,
      namespace: asset.namespace,
      owner: `feature:${asset.feature}`,
      path: asset.path,
    }));
  const appAssets: MessageAsset[] =
    appMessagesDirectory === undefined
      ? []
      : (await discoverAppMessageAssets(appMessagesDirectory)).map((asset) => ({
          directory: appMessagesDirectory,
          locale: asset.locale,
          namespace: asset.namespace,
          owner: "app",
          path: asset.path,
        }));

  return compileMessageFiles({ assets: [...appAssets, ...featureAssets] });
}

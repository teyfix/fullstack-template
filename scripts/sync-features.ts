import {
  renderFeatureMetadataRegistry,
  renderNavigationRegistry,
  renderProfileSectionRegistry,
  renderSeedRegistry,
} from "./feature-composition";
import {
  discoverFeatureGraph,
  type FeatureGraph,
  syncGeneratedDirectory,
  writeGeneratedFile,
} from "./feature-discovery";
import { buildFeatureMessageFiles } from "./feature-messages";
import {
  renderVirtualRoutesConfig,
  type VirtualRouteFiles,
  validateFeatureRouteDirectories,
} from "./feature-routes";

export type SyncFeaturesOptions = Readonly<{
  appMessagesDirectory?: string | URL;
  featureMetadataOutputFile?: string | URL;
  featuresDirectory?: string | URL;
  messagesDirectory?: string | URL;
  navigationOutputFile?: string | URL;
  profileSectionsOutputFile?: string | URL;
  routeFiles?: VirtualRouteFiles;
  routesOutputFile?: string | URL;
  seedOutputFile?: string | URL;
}>;

export type SyncFeaturesResult = Readonly<{
  graph: FeatureGraph;
  locales: readonly string[];
}>;

export const defaultFeaturesDirectory = new URL(
  "../src/feat/",
  import.meta.url,
);
export const defaultAppMessagesDirectory = new URL(
  "../src/app/messages/",
  import.meta.url,
);
export const defaultMessagesDirectory = new URL(
  "../messages/",
  import.meta.url,
);
export const defaultRoutesOutputFile = new URL(
  "../src/app/routes.generated.ts",
  import.meta.url,
);
export const defaultFeatureMetadataOutputFile = new URL(
  "../src/app/features.generated.ts",
  import.meta.url,
);
export const defaultNavigationOutputFile = new URL(
  "../src/app/navigation.generated.ts",
  import.meta.url,
);
export const defaultProfileSectionsOutputFile = new URL(
  "../src/app/profile-sections.generated.ts",
  import.meta.url,
);
export const defaultSeedOutputFile = new URL(
  "../src/app/seeds.generated.ts",
  import.meta.url,
);

/** Builds every artifact whose membership is controlled by feature folders. */
export async function syncFeatures({
  appMessagesDirectory = defaultAppMessagesDirectory,
  featureMetadataOutputFile = defaultFeatureMetadataOutputFile,
  featuresDirectory = defaultFeaturesDirectory,
  messagesDirectory = defaultMessagesDirectory,
  navigationOutputFile = defaultNavigationOutputFile,
  profileSectionsOutputFile = defaultProfileSectionsOutputFile,
  routeFiles,
  routesOutputFile = defaultRoutesOutputFile,
  seedOutputFile = defaultSeedOutputFile,
}: SyncFeaturesOptions = {}): Promise<SyncFeaturesResult> {
  const graph = await discoverFeatureGraph({ featuresDirectory });
  const messageFiles = await buildFeatureMessageFiles({
    appMessagesDirectory,
    assets: graph.assets,
    featuresDirectory,
  });
  await validateFeatureRouteDirectories(graph.features, featuresDirectory);
  const routeSource = renderVirtualRoutesConfig(
    graph.features,
    routeFiles === undefined ? {} : { files: routeFiles },
  );
  const featureMetadataSource = renderFeatureMetadataRegistry(graph.features);
  const navigationSource = renderNavigationRegistry(graph.features, {
    featuresDirectory,
    outputFile: navigationOutputFile,
  });
  const profileSectionsSource = renderProfileSectionRegistry(graph.assets, {
    featuresDirectory,
    outputFile: profileSectionsOutputFile,
  });
  const seedSource = renderSeedRegistry(graph.assets, {
    featuresDirectory,
    outputFile: seedOutputFile,
  });

  await Promise.all([
    writeGeneratedFile(routesOutputFile, routeSource),
    writeGeneratedFile(featureMetadataOutputFile, featureMetadataSource),
    writeGeneratedFile(navigationOutputFile, navigationSource),
    writeGeneratedFile(profileSectionsOutputFile, profileSectionsSource),
    writeGeneratedFile(seedOutputFile, seedSource),
    syncGeneratedDirectory({
      directory: messagesDirectory,
      files: messageFiles,
    }),
  ]);

  return {
    graph,
    locales: Object.keys(messageFiles)
      .map((filename) => filename.slice(0, -".json".length))
      .sort(),
  };
}

if (import.meta.main) await syncFeatures();

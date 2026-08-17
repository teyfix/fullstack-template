import "@tanstack/solid-start/server-only";

import { featureSeeds } from "~/app/seeds.generated";

export type SeedModuleLoader = Readonly<{
  feature: string;
  file: string;
  load(): Promise<unknown>;
}>;

type SeedModule = Readonly<{ seed(): Promise<void> }>;

function isSeedModule(value: unknown): value is SeedModule {
  return (
    typeof value === "object" &&
    value !== null &&
    "seed" in value &&
    typeof value.seed === "function"
  );
}

/** Runs discovered feature seeds in deterministic generated order. */
export async function runFeatureSeeds(
  loaders: readonly SeedModuleLoader[],
): Promise<void> {
  for (const loader of loaders) {
    const module = await loader.load();
    if (!isSeedModule(module)) {
      throw new TypeError(`${loader.file} must export async function seed()`);
    }
    await module.seed();
  }
}

if (import.meta.main) await runFeatureSeeds(featureSeeds);

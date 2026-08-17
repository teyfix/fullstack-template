import { describe, expect, test } from "bun:test";

import { runFeatureSeeds } from "./seed";

describe("runFeatureSeeds", () => {
  test("runs generated loaders in their provided deterministic order", async () => {
    const calls: string[] = [];

    await runFeatureSeeds([
      {
        feature: "alpha",
        file: "alpha/alpha.seed.ts",
        load: async () => ({ seed: async () => void calls.push("alpha") }),
      },
      {
        feature: "blog",
        file: "blog/blog.seed.ts",
        load: async () => ({ seed: async () => void calls.push("blog") }),
      },
    ]);

    expect(calls).toEqual(["alpha", "blog"]);
  });

  test("fails loudly when a discovered module violates the convention", async () => {
    await expect(
      runFeatureSeeds([
        {
          feature: "blog",
          file: "blog/blog.seed.ts",
          load: async () => ({}),
        },
      ]),
    ).rejects.toThrow("must export async function seed()");
  });
});

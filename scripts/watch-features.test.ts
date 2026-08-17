import { describe, expect, test } from "bun:test";

import {
  type FeatureWatchEvent,
  mergeFeatureWatchEvents,
  syncFeaturesOnChanges,
} from "./watch-features";

describe("syncFeaturesOnChanges", () => {
  test("merges feature and app-message watch streams", async () => {
    async function* events(
      filenames: readonly string[],
    ): AsyncIterable<FeatureWatchEvent> {
      for (const filename of filenames) yield { filename };
    }

    const filenames: string[] = [];
    for await (const event of mergeFeatureWatchEvents([
      events(["blog/posts/post.tables.ts", "blog"]),
      events(["en/common/header.yaml"]),
    ])) {
      if (event.filename !== null) filenames.push(event.filename);
    }

    expect(filenames.sort()).toEqual([
      "blog",
      "blog/posts/post.tables.ts",
      "en/common/header.yaml",
    ]);
  });

  test("rebuilds for source edits, route additions, and folder deletion events", async () => {
    async function* events(): AsyncIterable<FeatureWatchEvent> {
      yield { filename: "blog/posts/post.tables.ts" };
      yield { filename: "blog/routes/public/posts.tsx" };
      yield { filename: "blog" };
    }

    let rebuilds = 0;
    await syncFeaturesOnChanges(events(), async () => {
      rebuilds += 1;
    });
    expect(rebuilds).toBe(3);
  });

  test("propagates generator failures instead of publishing later states", async () => {
    async function* events(): AsyncIterable<FeatureWatchEvent> {
      yield { filename: null };
      yield { filename: "ignored-after-failure" };
    }

    let rebuilds = 0;
    await expect(
      syncFeaturesOnChanges(events(), async () => {
        rebuilds += 1;
        throw new Error("invalid feature graph");
      }),
    ).rejects.toThrow("invalid feature graph");
    expect(rebuilds).toBe(1);
  });
});

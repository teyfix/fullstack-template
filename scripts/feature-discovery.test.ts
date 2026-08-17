import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  classifyFeatureAsset,
  discoverFeatureAssets,
  discoverFeatureGraph,
  indexFeatureAssets,
  syncGeneratedDirectory,
  validateFeatureGraph,
} from "./feature-discovery";

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "feature-discovery-"));
  temporaryDirectories.push(directory);
  return directory;
}

async function fixture(root: string, path: string, source = "export {};\n") {
  const target = join(root, path);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, source, "utf8");
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("classifyFeatureAsset", () => {
  test("classifies colocated database, DTO, and seed modules", () => {
    expect(classifyFeatureAsset("blog/posts/post.tables.ts")).toEqual({
      feature: "blog",
      kind: "table",
      path: "blog/posts/post.tables.ts",
    });
    expect(classifyFeatureAsset("blog/posts/post.views.ts")?.kind).toBe("view");
    expect(classifyFeatureAsset("blog/posts/post.schema.ts")?.kind).toBe(
      "schema",
    );
    expect(classifyFeatureAsset("blog/posts/post.dto.ts")?.kind).toBe("dto");
    expect(classifyFeatureAsset("blog/blog.seed.ts")?.kind).toBe("seed");
    expect(classifyFeatureAsset("blog/blog.feature.ts")?.kind).toBe("feature");
    expect(classifyFeatureAsset("blog/blog.navigation.tsx")?.kind).toBe(
      "navigation",
    );
    expect(
      classifyFeatureAsset("blog/posts/posts.profile-section.tsx")?.kind,
    ).toBe("profileSection");
    expect(classifyFeatureAsset("blog/posts/post.test.ts")).toBeUndefined();
  });

  test("derives message namespaces from feature ownership and directories", () => {
    expect(classifyFeatureAsset("blog/posts/messages/en/editor.yaml")).toEqual({
      feature: "blog",
      kind: "message",
      locale: "en",
      namespace: "blog.posts.editor",
      path: "blog/posts/messages/en/editor.yaml",
    });
    expect(classifyFeatureAsset("blog/messages/tr/common/cta.yaml")).toEqual({
      feature: "blog",
      kind: "message",
      locale: "tr",
      namespace: "blog.common.cta",
      path: "blog/messages/tr/common/cta.yaml",
    });
  });

  test("rejects ambiguous or invalid conventional paths", () => {
    expect(() => classifyFeatureAsset("Blog Posts/post.tables.ts")).toThrow(
      "invalid feature path segment",
    );
    expect(() => classifyFeatureAsset("blog/messages/english.yaml")).toThrow(
      "must match",
    );
    expect(() =>
      classifyFeatureAsset("blog/messages/en/post.editor.yaml"),
    ).toThrow("invalid feature path segment");
  });
});

describe("discoverFeatureAssets", () => {
  test("discovers sorted assets and makes folder deletion authoritative", async () => {
    const root = await temporaryDirectory();
    await fixture(
      root,
      "blog/blog.feature.ts",
      `export const feature = {
        id: "blog",
        dependencies: [],
        contributions: ["database", "messages", "seeds"],
      } as const;\n`,
    );
    await fixture(
      root,
      "users/users.feature.ts",
      `export const feature = {
        id: "users",
        dependencies: [],
        contributions: [],
      } as const;\n`,
    );
    await fixture(root, "users/profile/profile.dto.ts");
    await fixture(root, "blog/posts/post.tables.ts");
    await fixture(root, "blog/comments/comment.views.ts");
    await fixture(root, "blog/posts/messages/en/list.yaml", "title: Posts\n");
    await fixture(root, "blog/blog.seed.ts");
    await fixture(root, "blog/posts/post.test.ts");

    const before = await discoverFeatureAssets({ featuresDirectory: root });
    expect(before.map(({ path }) => path)).toEqual([
      "blog/blog.feature.ts",
      "blog/blog.seed.ts",
      "blog/comments/comment.views.ts",
      "blog/posts/messages/en/list.yaml",
      "blog/posts/post.tables.ts",
      "users/profile/profile.dto.ts",
      "users/users.feature.ts",
    ]);
    expect(indexFeatureAssets(before).features).toEqual(["blog", "users"]);

    await rm(join(root, "blog"), { recursive: true });
    const after = await discoverFeatureAssets({ featuresDirectory: root });
    expect(after).toEqual([
      {
        feature: "users",
        kind: "dto",
        path: "users/profile/profile.dto.ts",
      },
      {
        feature: "users",
        kind: "feature",
        path: "users/users.feature.ts",
      },
    ]);
  });

  test("rejects namespace collisions across alternate colocation paths", async () => {
    const root = await temporaryDirectory();
    await fixture(root, "blog/messages/en/posts/list.yaml");
    await fixture(root, "blog/posts/messages/en/list.yaml");

    await expect(
      discoverFeatureAssets({ featuresDirectory: root }),
    ).rejects.toThrow("Duplicate feature message namespace");
  });

  test("treats an absent feature directory as an empty template", async () => {
    const root = await temporaryDirectory();
    expect(
      await discoverFeatureAssets({
        featuresDirectory: join(root, "not-created"),
      }),
    ).toEqual([]);
  });
});

describe("discoverFeatureGraph", () => {
  test("loads explicit manifests and validates dependencies and contributions", async () => {
    const root = await temporaryDirectory();
    await fixture(
      root,
      "identity/identity.feature.ts",
      `export const feature = {
        id: "identity",
        dependencies: [],
        contributions: ["contracts"],
      } as const;\n`,
    );
    await fixture(
      root,
      "blog/blog.feature.ts",
      `export default {
        id: "blog",
        dependencies: ["identity"],
        contributions: ["database", "messages", "navigation.admin", "routes", "seeds"],
      } as const;\n`,
    );
    await fixture(root, "blog/blog.navigation.tsx");
    await fixture(root, "blog/posts/post.tables.ts");
    await fixture(root, "blog/posts/post.views.ts");
    await fixture(root, "blog/posts/post.dto.ts");
    await fixture(root, "blog/posts/messages/en/list.yaml");
    await fixture(root, "blog/blog.seed.ts");

    const graph = await discoverFeatureGraph({ featuresDirectory: root });
    expect(
      graph.features.map(({ descriptor }) => ({
        dependencies: descriptor.dependencies,
        id: descriptor.id,
      })),
    ).toEqual([
      { dependencies: ["identity"], id: "blog" },
      { dependencies: [], id: "identity" },
    ]);
  });

  test("requires every owned asset to have a root feature manifest", () => {
    expect(() =>
      validateFeatureGraph(
        [],
        [
          {
            feature: "blog",
            kind: "table",
            path: "blog/posts/post.tables.ts",
          },
        ],
      ),
    ).toThrow("belongs to undeclared feature blog");
  });

  test("rejects undeclared dependencies and missing contributions", () => {
    expect(() =>
      validateFeatureGraph(
        [
          {
            descriptor: {
              contributions: ["routes"],
              dependencies: ["identity"],
              id: "blog",
            },
            path: "blog/blog.feature.ts",
          },
        ],
        [
          {
            feature: "blog",
            kind: "feature",
            path: "blog/blog.feature.ts",
          },
        ],
      ),
    ).toThrow("depends on undeclared feature identity");

    expect(() =>
      validateFeatureGraph(
        [
          {
            descriptor: {
              contributions: [],
              dependencies: [],
              id: "blog",
            },
            path: "blog/blog.feature.ts",
          },
        ],
        [
          {
            feature: "blog",
            kind: "table",
            path: "blog/posts/post.tables.ts",
          },
        ],
      ),
    ).toThrow("does not declare the database contribution");
  });

  test("requires declared navigation, profile-section, and seed modules", () => {
    const discovered = (contributions: readonly string[]) => [
      {
        descriptor: { contributions, dependencies: [], id: "blog" },
        path: "blog/blog.feature.ts",
      },
    ];

    expect(() =>
      validateFeatureGraph(discovered(["navigation.public"]), []),
    ).toThrow("missing blog/blog.navigation.tsx");
    expect(() =>
      validateFeatureGraph(discovered(["profile.sections"]), []),
    ).toThrow("owns no *.profile-section.tsx module");
    expect(() => validateFeatureGraph(discovered(["seeds"]), [])).toThrow(
      "owns no *.seed.ts module",
    );
  });

  test("reports a deterministic dependency cycle", () => {
    expect(() =>
      validateFeatureGraph(
        [
          {
            descriptor: {
              contributions: [],
              dependencies: ["identity"],
              id: "blog",
            },
            path: "blog/blog.feature.ts",
          },
          {
            descriptor: {
              contributions: [],
              dependencies: ["blog"],
              id: "identity",
            },
            path: "identity/identity.feature.ts",
          },
        ],
        [],
      ),
    ).toThrow("blog -> identity -> blog");
  });
});

describe("generated feature artifacts", () => {
  test("removes stale generated locale files and preserves current output", async () => {
    const root = await temporaryDirectory();
    const generated = join(root, "messages/generated");
    await fixture(generated, "en.json", '{"old":true}\n');
    await fixture(generated, "tr.json", '{"stale":true}\n');

    await syncGeneratedDirectory({
      directory: generated,
      files: { "en.json": '{"current":true}\n' },
    });

    expect(await readFile(join(generated, "en.json"), "utf8")).toBe(
      '{"current":true}\n',
    );
    expect(Bun.file(join(generated, "tr.json")).exists()).resolves.toBe(false);
  });

  test("refuses generated paths that escape the owned directory", async () => {
    const root = await temporaryDirectory();
    await expect(
      syncGeneratedDirectory({
        directory: root,
        files: { "../outside.json": "{}\n" },
      }),
    ).rejects.toThrow("must stay inside");
  });
});

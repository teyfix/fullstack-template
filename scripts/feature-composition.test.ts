import { describe, expect, test } from "bun:test";
import {
  renderFeatureMetadataRegistry,
  renderNavigationRegistry,
  renderProfileSectionRegistry,
  renderSeedRegistry,
} from "./feature-composition";
import type { DiscoveredFeature, FeatureAsset } from "./feature-discovery";

const root = "/workspace/src/feat";

function feature(
  id: string,
  contributions: readonly string[],
): DiscoveredFeature {
  return {
    descriptor: { contributions, dependencies: [], id },
    path: `${id}/${id}.feature.ts`,
  };
}

const blogAssets = [
  {
    feature: "blog",
    kind: "navigation",
    path: "blog/blog.navigation.tsx",
  },
  {
    feature: "blog",
    kind: "profileSection",
    path: "blog/posts/profile/posts.profile-section.tsx",
  },
  { feature: "blog", kind: "seed", path: "blog/blog.seed.ts" },
  {
    feature: "blog",
    kind: "table",
    path: "blog/posts/post.tables.ts",
  },
  {
    feature: "blog",
    kind: "message",
    locale: "en",
    namespace: "blog.posts.list",
    path: "blog/posts/messages/en/list.yaml",
  },
] as const satisfies readonly FeatureAsset[];

describe("concern-specific feature composition", () => {
  test("renders only each registry's permitted feature modules", () => {
    const features = [
      feature("blog", [
        "navigation.admin",
        "navigation.public",
        "profile.sections",
        "seeds",
      ]),
    ];
    const navigation = renderNavigationRegistry(features, {
      featuresDirectory: root,
      outputFile: "/workspace/src/app/navigation.generated.ts",
    });
    const sections = renderProfileSectionRegistry(blogAssets, {
      featuresDirectory: root,
      outputFile: "/workspace/src/app/profile-sections.generated.ts",
    });
    const seeds = renderSeedRegistry(blogAssets, {
      featuresDirectory: root,
      outputFile: "/workspace/src/app/seeds.generated.ts",
    });

    expect(navigation).toContain('from "../feat/blog/blog.navigation"');
    expect(navigation).not.toContain("post.tables");
    expect(navigation).not.toContain("messages/en");
    expect(sections).toContain(
      'from "../feat/blog/posts/profile/posts.profile-section"',
    );
    expect(sections).not.toContain("blog.seed");
    expect(seeds).toContain('import "@tanstack/solid-start/server-only";');
    expect(seeds).toContain('load: () => import("../feat/blog/blog.seed")');
    expect(seeds).not.toContain("post.tables");
  });

  test("removing a feature removes navigation, profile, seed, and metadata", () => {
    const blog = feature("blog", [
      "navigation.admin",
      "navigation.public",
      "profile.sections",
      "seeds",
    ]);
    const options = {
      featuresDirectory: root,
      outputFile: "/workspace/src/app/composition.generated.ts",
    };

    expect(renderFeatureMetadataRegistry([blog])).toContain('"id": "blog"');
    expect(renderNavigationRegistry([blog], options)).toContain("feat/blog");
    expect(renderProfileSectionRegistry(blogAssets, options)).toContain(
      "feat/blog",
    );
    expect(renderSeedRegistry(blogAssets, options)).toContain("feat/blog");

    expect(renderFeatureMetadataRegistry([])).not.toContain('"id": "blog"');
    expect(renderNavigationRegistry([], options)).not.toContain("feat/blog");
    expect(renderProfileSectionRegistry([], options)).not.toContain(
      "feat/blog",
    );
    expect(renderSeedRegistry([], options)).not.toContain("feat/blog");
  });

  test("is deterministic when discovery input order changes", () => {
    const blog = feature("blog", ["navigation.public"]);
    const auth = feature("auth", ["navigation.public"]);
    const options = {
      featuresDirectory: root,
      outputFile: "/workspace/src/app/navigation.generated.ts",
    };

    expect(renderNavigationRegistry([blog, auth], options)).toBe(
      renderNavigationRegistry([auth, blog], options),
    );
  });
});

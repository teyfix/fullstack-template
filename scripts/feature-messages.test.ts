import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { FeatureMessageAsset } from "./feature-discovery";
import {
  buildFeatureMessageFiles,
  classifyAppMessageAsset,
  discoverAppMessageAssets,
} from "./feature-messages";

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "feature-messages-"));
  temporaryDirectories.push(directory);
  return directory;
}

async function fixture(root: string, path: string, source: string) {
  const target = join(root, path);
  await mkdir(join(target, ".."), { recursive: true });
  await writeFile(target, source, "utf8");
}

function message(
  path: string,
  locale: string,
  namespace: string,
): FeatureMessageAsset {
  return { feature: "blog", kind: "message", locale, namespace, path };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("application message discovery", () => {
  test("derives namespaces from the path after the locale", async () => {
    expect(classifyAppMessageAsset("en/common/header.yaml")).toEqual({
      kind: "app-message",
      locale: "en",
      namespace: "common.header",
      path: "en/common/header.yaml",
    });
    expect(classifyAppMessageAsset("README.md")).toBeUndefined();
    expect(() => classifyAppMessageAsset("common/header.yaml")).toThrow(
      "must match <locale>/**/*.yaml",
    );

    const root = await temporaryDirectory();
    await fixture(
      root,
      "tr/common/header.yaml",
      "---\ndescription: Header.\ngenerated: true\n---\ntitle: Başlık\n",
    );
    await fixture(
      root,
      "en/common/header.yaml",
      "---\ndescription: Header.\ngenerated: true\n---\ntitle: Header\n",
    );

    expect(await discoverAppMessageAssets(root)).toEqual([
      {
        kind: "app-message",
        locale: "en",
        namespace: "common.header",
        path: "en/common/header.yaml",
      },
      {
        kind: "app-message",
        locale: "tr",
        namespace: "common.header",
        path: "tr/common/header.yaml",
      },
    ]);
  });

  test("allows an application without an app-message directory", async () => {
    const root = await temporaryDirectory();

    expect(
      await discoverAppMessageAssets(join(root, "missing-messages")),
    ).toEqual([]);
  });
});

describe("message compiler adapter", () => {
  test("combines application and feature assets through the shared compiler", async () => {
    const featureRoot = await temporaryDirectory();
    const appRoot = await temporaryDirectory();
    const englishPath = "blog/posts/messages/en/list.yaml";
    const turkishPath = "blog/posts/messages/tr/list.yaml";
    await fixture(
      featureRoot,
      englishPath,
      "---\ndescription: English posts.\ngenerated: true\n---\ntitle: Posts\n",
    );
    await fixture(
      featureRoot,
      turkishPath,
      "---\ndescription: Turkish posts.\ngenerated: true\n---\ntitle: Gönderiler\n",
    );
    await fixture(
      appRoot,
      "en/common/header.yaml",
      "---\ndescription: English header.\ngenerated: true\n---\ntitle: Application\n",
    );
    await fixture(
      appRoot,
      "tr/common/header.yaml",
      "---\ndescription: Turkish header.\ngenerated: true\n---\ntitle: Uygulama\n",
    );

    const files = await buildFeatureMessageFiles({
      appMessagesDirectory: appRoot,
      assets: [
        message(turkishPath, "tr", "blog.posts.list"),
        message(englishPath, "en", "blog.posts.list"),
      ],
      featuresDirectory: featureRoot,
    });

    expect(Object.keys(files)).toEqual(["en.json", "tr.json"]);
    expect(files["en.json"]).toContain('"blog.posts.list.title": "Posts"');
    expect(files["en.json"]).toContain('"common.header.title": "Application"');
  });
});

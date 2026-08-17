import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { FeatureMessageAsset } from "./feature-discovery";
import {
  buildFeatureMessageFiles,
  classifyAppMessageAsset,
  discoverAppMessageAssets,
  loadFeatureMessageCatalogs,
  parseFeatureMessageFile,
  renderFeatureMessagesJson,
  validateFeatureMessageExamples,
  validateFeatureMessageParity,
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

describe("parseFeatureMessageFile", () => {
  test("keeps front matter as metadata and the second document as messages", () => {
    expect(
      parseFeatureMessageFile(
        "blog/posts/messages/en/list.yaml",
        `---
description: Blog post list copy.
generated: true
examples:
  count:
    expected: You have 2 posts
    values:
      count: 2
---
title: Posts
count: "You have {count} posts"
`,
      ),
    ).toEqual({
      messages: { count: "You have {count} posts", title: "Posts" },
      metadata: {
        description: "Blog post list copy.",
        examples: {
          count: { expected: "You have 2 posts", values: { count: 2 } },
        },
        generated: true,
      },
    });
  });

  test("rejects files without exactly two documents", () => {
    expect(() =>
      parseFeatureMessageFile("messages/en/list.yaml", "title: Posts\n"),
    ).toThrow("metadata front matter");
    expect(() =>
      parseFeatureMessageFile(
        "messages/en/list.yaml",
        "---\ndescription: Copy.\ngenerated: true\nowner: blog\n---\ntitle: Posts\n",
      ),
    ).toThrow();
  });

  test("executes ICU plural and gender/select examples", () => {
    const parsed = parseFeatureMessageFile(
      "blog/posts/messages/en/detail.yaml",
      `---
description: Executable ICU examples.
generated: true
examples:
  author:
    expected: She wrote this
    values:
      gender: female
  comments:
    expected: 2 comments
    values:
      count: 2
---
author: "{gender, select, male {He wrote this} female {She wrote this} other {They wrote this}}"
comments: "{count, plural, one {# comment} other {# comments}}"
`,
    );

    expect(() =>
      validateFeatureMessageExamples(
        "en",
        "blog.posts.detail",
        "blog/posts/messages/en/detail.yaml",
        parsed,
      ),
    ).not.toThrow();
  });

  test("rejects examples for absent keys or incorrect output", () => {
    const absent = parseFeatureMessageFile(
      "messages/en/list.yaml",
      "---\ndescription: Missing key.\ngenerated: true\nexamples:\n  missing:\n    expected: Missing\n    values: {}\n---\ntitle: Posts\n",
    );
    expect(() =>
      validateFeatureMessageExamples("en", "blog.list", "list.yaml", absent),
    ).toThrow("does not reference a message");

    const wrong = parseFeatureMessageFile(
      "messages/en/list.yaml",
      "---\ndescription: Wrong output.\ngenerated: true\nexamples:\n  title:\n    expected: Articles\n    values: {}\n---\ntitle: Posts\n",
    );
    expect(() =>
      validateFeatureMessageExamples("en", "blog.list", "list.yaml", wrong),
    ).toThrow("rendered");
  });
});

describe("app message discovery", () => {
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

  test("applies strict metadata and executable ICU examples", async () => {
    const root = await temporaryDirectory();
    await fixture(
      root,
      "en/common/header.yaml",
      `---
description: Invalid executable example.
generated: true
examples:
  greeting:
    expected: Hello Ada
    values:
      name: Grace
---
greeting: "Hello {name}"
`,
    );

    await expect(
      loadFeatureMessageCatalogs({
        appMessagesDirectory: root,
        assets: [],
        featuresDirectory: join(root, "features"),
      }),
    ).rejects.toThrow("rendered");
  });
});

describe("feature message catalogs", () => {
  test("builds deterministic dotted locale JSON from namespace paths", async () => {
    const root = await temporaryDirectory();
    const appRoot = await temporaryDirectory();
    const englishPath = "blog/posts/messages/en/list.yaml";
    const turkishPath = "blog/posts/messages/tr/list.yaml";
    await fixture(
      root,
      englishPath,
      "---\ndescription: English posts.\ngenerated: true\n---\ntitle: Posts\nempty: No posts\n",
    );
    await fixture(
      root,
      turkishPath,
      "---\ndescription: Turkish posts.\ngenerated: true\n---\nempty: Gönderi yok\ntitle: Gönderiler\n",
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
    const assets = [
      message(turkishPath, "tr", "blog.posts.list"),
      message(englishPath, "en", "blog.posts.list"),
    ];

    const catalogs = await loadFeatureMessageCatalogs({
      appMessagesDirectory: appRoot,
      assets,
      featuresDirectory: root,
    });
    expect(catalogs.en).toEqual({
      blog: { posts: { list: { empty: "No posts", title: "Posts" } } },
      common: { header: { title: "Application" } },
    });

    const files = await buildFeatureMessageFiles({
      appMessagesDirectory: appRoot,
      assets,
      featuresDirectory: root,
    });
    expect(Object.keys(files)).toEqual(["en.json", "tr.json"]);
    expect(files["en.json"]).toBe(renderFeatureMessagesJson(catalogs.en ?? {}));
    expect(files["en.json"]).toContain('"blog.posts.list.title": "Posts"');
    expect(files["en.json"]).toContain('"common.header.title": "Application"');
    expect(files["en.json"]).not.toContain('"blog": {');
  });

  test("rejects locale drift and overlapping namespace files", async () => {
    expect(() =>
      validateFeatureMessageParity({
        en: { blog: { title: "Blog" } },
        tr: { blog: { heading: "Blog" } },
      }),
    ).toThrow("tr message keys do not match en");

    const root = await temporaryDirectory();
    const parent = "blog/messages/en/posts.yaml";
    const child = "blog/messages/en/posts/list.yaml";
    await fixture(
      root,
      parent,
      "---\ndescription: Parent.\ngenerated: true\n---\ntitle: Posts\n",
    );
    await fixture(
      root,
      child,
      "---\ndescription: Child.\ngenerated: true\n---\ntitle: Posts\n",
    );
    await expect(
      loadFeatureMessageCatalogs({
        assets: [
          message(parent, "en", "blog.posts"),
          message(child, "en", "blog.posts.list"),
        ],
        featuresDirectory: root,
      }),
    ).rejects.toThrow("overlaps");
  });

  test("rejects app and feature namespace overlap across locales", async () => {
    const featureRoot = await temporaryDirectory();
    const appRoot = await temporaryDirectory();
    const featurePath = "blog/posts/messages/en/list.yaml";
    await fixture(
      featureRoot,
      featurePath,
      "---\ndescription: Posts.\ngenerated: true\n---\ntitle: Posts\n",
    );
    await fixture(
      appRoot,
      "tr/blog/posts.yaml",
      "---\ndescription: Wrong app ownership.\ngenerated: true\n---\ntitle: Gönderiler\n",
    );

    await expect(
      loadFeatureMessageCatalogs({
        appMessagesDirectory: appRoot,
        assets: [message(featurePath, "en", "blog.posts.list")],
        featuresDirectory: featureRoot,
      }),
    ).rejects.toThrow(
      "App message namespace blog.posts overlaps feature message namespace blog.posts.list",
    );
  });

  test("rejects non-string leaves unsupported by the ICU1 storage plugin", () => {
    expect(() =>
      renderFeatureMessagesJson({ blog: { count: ["not", "icu"] } }),
    ).toThrow("must be an ICU MessageFormat string");
  });
});

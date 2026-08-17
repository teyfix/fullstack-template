import { afterEach, describe, expect, test } from "bun:test";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { syncFeatures } from "./sync-features";

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "sync-features-"));
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

describe("syncFeatures", () => {
  test("generates routes and messages, then removes a deleted feature", async () => {
    const root = await temporaryDirectory();
    const appMessagesDirectory = join(root, "src/app/messages");
    const featuresDirectory = join(root, "src/feat");
    const featureMetadataOutputFile = join(
      root,
      "src/app/features.generated.ts",
    );
    const navigationOutputFile = join(root, "src/app/navigation.generated.ts");
    const profileSectionsOutputFile = join(
      root,
      "src/app/profile-sections.generated.ts",
    );
    const routesOutputFile = join(root, "src/app/routes.generated.ts");
    const seedOutputFile = join(root, "src/app/seeds.generated.ts");
    const messagesDirectory = join(root, "messages");
    await fixture(
      appMessagesDirectory,
      "en/common/header.yaml",
      "---\ndescription: App header.\ngenerated: true\n---\ntitle: Application\n",
    );
    await fixture(
      featuresDirectory,
      "identity/identity.feature.ts",
      `export const feature = {
        id: "identity",
        dependencies: [],
        contributions: ["messages"],
      } as const;\n`,
    );
    await fixture(
      featuresDirectory,
      "identity/messages/en/common.yaml",
      "---\ndescription: Shared identity.\ngenerated: true\n---\nsignIn: Sign in\n",
    );
    await fixture(
      featuresDirectory,
      "blog/blog.feature.ts",
      `export const feature = {
        id: "blog",
        dependencies: [],
        contributions: ["messages", "navigation.admin", "navigation.public", "profile.sections", "routes.admin", "routes.public", "seeds"],
      } as const;\n`,
    );
    await fixture(featuresDirectory, "blog/blog.navigation.tsx");
    await fixture(featuresDirectory, "blog/blog.seed.ts");
    await fixture(
      featuresDirectory,
      "blog/posts/profile/posts.profile-section.tsx",
    );
    await fixture(featuresDirectory, "blog/routes/public/posts.tsx");
    await fixture(featuresDirectory, "blog/routes/admin/posts.tsx");
    await fixture(
      featuresDirectory,
      "blog/posts/messages/en/list.yaml",
      "---\ndescription: Posts.\ngenerated: true\n---\ntitle: Posts\n",
    );

    const before = await syncFeatures({
      appMessagesDirectory,
      featureMetadataOutputFile,
      featuresDirectory,
      messagesDirectory,
      navigationOutputFile,
      profileSectionsOutputFile,
      routesOutputFile,
      seedOutputFile,
    });
    expect(before.locales).toEqual(["en"]);
    expect(await readFile(routesOutputFile, "utf8")).toContain(
      "feat/blog/routes/public",
    );
    expect(await readFile(featureMetadataOutputFile, "utf8")).toContain(
      '"id": "blog"',
    );
    expect(await readFile(navigationOutputFile, "utf8")).toContain(
      "../feat/blog/blog.navigation",
    );
    expect(await readFile(profileSectionsOutputFile, "utf8")).toContain(
      "../feat/blog/posts/profile/posts.profile-section",
    );
    expect(await readFile(seedOutputFile, "utf8")).toContain(
      "../feat/blog/blog.seed",
    );
    expect(await readFile(join(messagesDirectory, "en.json"), "utf8")).toBe(
      '{\n  "blog.posts.list.title": "Posts",\n  "common.header.title": "Application",\n  "identity.common.signIn": "Sign in"\n}\n',
    );

    await rm(join(featuresDirectory, "blog"), { recursive: true });
    const after = await syncFeatures({
      appMessagesDirectory,
      featureMetadataOutputFile,
      featuresDirectory,
      messagesDirectory,
      navigationOutputFile,
      profileSectionsOutputFile,
      routesOutputFile,
      seedOutputFile,
    });
    expect(after.graph.features.map(({ descriptor }) => descriptor.id)).toEqual(
      ["identity"],
    );
    expect(await readFile(routesOutputFile, "utf8")).not.toContain("feat/blog");
    const generatedSources = await Promise.all(
      [
        featureMetadataOutputFile,
        navigationOutputFile,
        profileSectionsOutputFile,
        seedOutputFile,
      ].map((path) => readFile(path, "utf8")),
    );
    expect(generatedSources.every((source) => !source.includes("blog"))).toBe(
      true,
    );
    expect(generatedSources[0]).toContain('"id": "identity"');
    expect(await readFile(join(messagesDirectory, "en.json"), "utf8")).toBe(
      '{\n  "common.header.title": "Application",\n  "identity.common.signIn": "Sign in"\n}\n',
    );
  });

  test("removes a stale locale after its app-owned sources disappear", async () => {
    const root = await temporaryDirectory();
    const appMessagesDirectory = join(root, "src/app/messages");
    const featuresDirectory = join(root, "src/feat");
    const messagesDirectory = join(root, "messages");
    const featureMetadataOutputFile = join(
      root,
      "src/app/features.generated.ts",
    );
    const navigationOutputFile = join(root, "src/app/navigation.generated.ts");
    const profileSectionsOutputFile = join(
      root,
      "src/app/profile-sections.generated.ts",
    );
    const routesOutputFile = join(root, "src/app/routes.generated.ts");
    const seedOutputFile = join(root, "src/app/seeds.generated.ts");
    await fixture(
      featuresDirectory,
      "shell/shell.feature.ts",
      `export const feature = {
        id: "shell",
        dependencies: [],
        contributions: [],
      } as const;\n`,
    );
    await fixture(
      appMessagesDirectory,
      "en/common/footer.yaml",
      "---\ndescription: English footer.\ngenerated: true\n---\nlabel: Footer\n",
    );
    await fixture(
      appMessagesDirectory,
      "tr/common/footer.yaml",
      "---\ndescription: Turkish footer.\ngenerated: true\n---\nlabel: Alt bilgi\n",
    );

    const options = {
      appMessagesDirectory,
      featureMetadataOutputFile,
      featuresDirectory,
      messagesDirectory,
      navigationOutputFile,
      profileSectionsOutputFile,
      routesOutputFile,
      seedOutputFile,
    };
    expect((await syncFeatures(options)).locales).toEqual(["en", "tr"]);
    expect(await readdir(messagesDirectory)).toEqual(["en.json", "tr.json"]);

    await rm(join(appMessagesDirectory, "tr"), { recursive: true });
    expect((await syncFeatures(options)).locales).toEqual(["en"]);
    expect(await readdir(messagesDirectory)).toEqual(["en.json"]);
  });
});

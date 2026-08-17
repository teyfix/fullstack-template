import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { DiscoveredFeature } from "./feature-discovery";
import {
  renderVirtualRoutesConfig,
  validateFeatureRouteDirectories,
  writeVirtualRoutesConfig,
} from "./feature-routes";

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "feature-routes-"));
  temporaryDirectories.push(directory);
  return directory;
}

function feature(
  id: string,
  contributions: readonly string[],
): DiscoveredFeature {
  return {
    descriptor: { contributions, dependencies: [], id },
    path: `${id}/${id}.feature.ts`,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("renderVirtualRoutesConfig", () => {
  test("renders app shells and sorted literal feature mounts", () => {
    const source = renderVirtualRoutesConfig([
      feature("users", ["routes.admin"]),
      feature("blog", ["routes.public", "routes.admin"]),
      feature("identity", ["contracts"]),
    ]);

    expect(source).toContain('rootRoute("app/routes/root.tsx", [');
    expect(source).toContain('index("app/routes/index.tsx")');
    expect(source).toContain('physical("", "feat/blog/routes/public")');
    expect(source).toContain('route("/admin", "app/routes/admin.tsx", [');
    expect(source.indexOf('"feat/blog/routes/admin"')).toBeLessThan(
      source.indexOf('"feat/users/routes/admin"'),
    );
    expect(source).not.toContain("feat/identity/routes");
    expect(source).toEndWith("export default routes;\n");
  });

  test("removing a feature removes all of its physical mounts", () => {
    const withBlog = renderVirtualRoutesConfig([
      feature("blog", ["routes.public", "routes.admin"]),
    ]);
    const withoutBlog = renderVirtualRoutesConfig([]);

    expect(withBlog).toContain("feat/blog/routes/public");
    expect(withBlog).toContain("feat/blog/routes/admin");
    expect(withoutBlog).not.toContain("feat/blog");
    expect(withoutBlog).toContain('route("/admin"');
  });
});

describe("writeVirtualRoutesConfig", () => {
  test("requires every declared physical route directory", async () => {
    const root = await temporaryDirectory();
    const features = [feature("blog", ["routes.public", "routes.admin"])];
    await mkdir(join(root, "blog/routes/public"), { recursive: true });

    await expect(
      validateFeatureRouteDirectories(features, root),
    ).rejects.toThrow("blog:routes.admin");
  });

  test("writes an importable virtual route config", async () => {
    const root = await temporaryDirectory();
    const outputFile = join(root, "routes.generated.ts");
    const features = [feature("blog", ["routes.public", "routes.admin"])];
    await Promise.all([
      mkdir(join(root, "blog/routes/public"), { recursive: true }),
      mkdir(join(root, "blog/routes/admin"), { recursive: true }),
    ]);
    await symlink(resolve("node_modules"), join(root, "node_modules"), "dir");

    await writeVirtualRoutesConfig({
      features,
      featuresDirectory: root,
      outputFile,
    });
    const source = await readFile(outputFile, "utf8");
    expect(source).toContain("@tanstack/virtual-file-routes");

    const generated = (await import(outputFile)) as {
      routes: {
        children: Array<{ type: string }>;
        file: string;
        type: string;
      };
    };
    expect(generated.routes).toMatchObject({
      file: "app/routes/root.tsx",
      type: "root",
    });
    expect(generated.routes.children.map(({ type }) => type)).toEqual([
      "index",
      "physical",
      "route",
    ]);
  });
});

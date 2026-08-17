import { describe, expect, test } from "bun:test";

import {
  type GenerateMigration,
  generateNamedMigration,
  parseMigrationName,
} from "./generate-migration";

describe("parseMigrationName", () => {
  test("accepts explicit review-friendly names", () => {
    expect(parseMigrationName("initial")).toBe("initial");
    expect(parseMigrationName(" remove_blog ")).toBe("remove_blog");
  });

  test("rejects absent or unsafe names", () => {
    expect(() => parseMigrationName(undefined)).toThrow(
      "Provide a migration name",
    );
    expect(() => parseMigrationName("Initial migration")).toThrow(
      "Migration names use lowercase",
    );
  });
});

describe("generateNamedMigration", () => {
  test("combines the repository config with the requested name", async () => {
    const calls: unknown[] = [];
    const generate: GenerateMigration = async (options) => {
      calls.push(options);
      return {
        dialect: "postgresql",
        migration_path: "drizzle/20260817000000_initial/migration.sql",
        status: "ok",
      };
    };

    await expect(generateNamedMigration("initial", generate)).resolves.toEqual({
      dialect: "postgresql",
      migration_path: "drizzle/20260817000000_initial/migration.sql",
      status: "ok",
    });
    expect(calls).toEqual([{ config: "./drizzle.config.ts", name: "initial" }]);
  });

  test("turns unresolved migration decisions into a hard failure", async () => {
    const generate = async () =>
      ({ status: "missing_hints", unresolved: [] }) as const;

    await expect(
      generateNamedMigration("remove_blog", generate),
    ).rejects.toThrow("explicit rename/data-loss hints");
  });
});

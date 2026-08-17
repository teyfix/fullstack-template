// @vitest-environment node

import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import * as d from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { describe, expect, test } from "vitest";

const migrationsFolder = fileURLToPath(new URL("./", import.meta.url));
const migrationJournal = d
  .pgSchema("drizzle")
  .table("__drizzle_migrations", { migrationName: d.text("name") });

describe("committed migrations", () => {
  test("apply cleanly and idempotently", async () => {
    const client = new PGlite();
    const database = drizzle({ client });

    try {
      await expect(
        migrate(database, { migrationsFolder }),
      ).resolves.toBeUndefined();

      const applied = await database.select().from(migrationJournal);
      expect(
        applied.some(({ migrationName }) =>
          migrationName?.endsWith("_initial"),
        ),
      ).toBe(true);
      await expect(
        migrate(database, { migrationsFolder }),
      ).resolves.toBeUndefined();
    } finally {
      await client.close();
    }
  }, 15_000);
});

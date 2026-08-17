import { describe, expect, test } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";

import { profile } from "./profile.tables";

describe("profile table", () => {
  test("keeps the lifecycle and provider-neutral user reference", () => {
    const config = getTableConfig(profile);

    expect(config.schema).toBe("journal");
    expect(config.columns.map(({ name }) => name)).toEqual([
      "id",
      "bio",
      "display_name",
      "handle",
      "user_id",
      "created_at",
      "deleted_at",
      "updated_at",
    ]);
    expect(config.foreignKeys).toHaveLength(0);
  });
});

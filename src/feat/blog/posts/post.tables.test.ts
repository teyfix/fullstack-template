import { describe, expect, test } from "bun:test";
import { getTableConfig } from "drizzle-orm/pg-core";

import { post } from "./post.tables";

describe("blog post table", () => {
  test("owns lifecycle columns without coupling to auth tables", () => {
    const config = getTableConfig(post);

    expect(config.schema).toBe("journal");
    const columns = config.columns.map(({ name }) => name);
    for (const name of [
      "id",
      "author_id",
      "created_at",
      "updated_at",
      "deleted_at",
    ]) {
      expect(columns).toContain(name);
    }
    expect(config.foreignKeys).toHaveLength(0);
  });
});

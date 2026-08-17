import { describe, expect, test } from "bun:test";
import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

import { comment } from "./comment.tables";

describe("blog comment table", () => {
  test("references posts inside the same removable feature", () => {
    const config = getTableConfig(comment);

    const columns = config.columns.map(({ name }) => name);
    for (const name of [
      "id",
      "post_id",
      "author_id",
      "created_at",
      "updated_at",
      "deleted_at",
    ]) {
      expect(columns).toContain(name);
    }
    expect(config.foreignKeys).toHaveLength(1);
    const reference = config.foreignKeys[0]?.reference();
    expect(reference && getTableName(reference.foreignTable)).toBe("blog_post");
  });
});

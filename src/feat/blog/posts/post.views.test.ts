import { describe, expect, test } from "bun:test";
import { formatQuery, renderExecutable } from "@teyfix/drizzle/render";
import { getViewConfig } from "drizzle-orm/pg-core";

import { activePost } from "./post.views";

describe("active blog post view", () => {
  test("owns the soft-delete predicate and omits deletedAt", async () => {
    const expectedSQL = await Bun.file(
      new URL("./post.views.test.sql", import.meta.url),
    ).text();
    const query = getViewConfig(activePost).query;
    const generatedSQL = query === undefined ? "" : renderExecutable(query).sql;

    expect(activePost).not.toHaveProperty("deletedAt");
    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

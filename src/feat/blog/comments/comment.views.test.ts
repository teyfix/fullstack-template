import { describe, expect, test } from "bun:test";
import { formatQuery, renderExecutable } from "@teyfix/drizzle/render";
import { getViewConfig } from "drizzle-orm/pg-core";

import { activeComment } from "./comment.views";

describe("active blog comment view", () => {
  test("owns the soft-delete predicate and omits deletedAt", async () => {
    const expectedSQL = await Bun.file(
      new URL("./comment.views.test.sql", import.meta.url),
    ).text();
    const query = getViewConfig(activeComment).query;
    const generatedSQL = query === undefined ? "" : renderExecutable(query).sql;

    expect(activeComment).not.toHaveProperty("deletedAt");
    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

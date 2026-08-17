import { describe, expect, test } from "bun:test";
import { formatQuery } from "@teyfix/drizzle/render";

import { createPublishedCommentListQuery } from "./comment.db";

describe("blog comment queries", () => {
  test("compiles the reviewed post comment listing", async () => {
    const expectedSQL = await Bun.file(
      new URL("./comment.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createPublishedCommentListQuery({
      params: { postId: "20000000-0000-4000-8000-000000000001" },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

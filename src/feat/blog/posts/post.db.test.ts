import { describe, expect, test } from "bun:test";
import { formatQuery } from "@teyfix/drizzle/render";

import {
  createPublishedPostBySlugQuery,
  createPublishedPostListByAuthorQuery,
  createPublishedPostListQuery,
} from "./post.db";

describe("blog post queries", () => {
  test("compiles the reviewed published-post listing", async () => {
    const expectedSQL = await Bun.file(
      new URL("./post.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createPublishedPostListQuery({
      params: {},
      searchParams: { pagination: { offset: 12, take: 12 } },
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });

  test("compiles the reviewed published-post slug lookup", async () => {
    const expectedSQL = await Bun.file(
      new URL("./post-by-slug.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createPublishedPostBySlugQuery({
      params: { slug: "composable-features" },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });

  test("compiles the reviewed published posts by author lookup", async () => {
    const expectedSQL = await Bun.file(
      new URL("./posts-by-author.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createPublishedPostListByAuthorQuery({
      params: { authorId: "00000000-0000-4000-8000-000000000001" },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

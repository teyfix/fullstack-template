import { describe, expect, test } from "bun:test";

import { PostDatabaseDomainSchema } from "./post.schema";

describe("post database boundary", () => {
  test("adapts view Dates before enforcing the shared domain", () => {
    expect(
      PostDatabaseDomainSchema.parse({
        authorId: "00000000-0000-4000-8000-000000000001",
        body: "Body",
        createdAt: new Date("2026-08-17T08:00:00.000Z"),
        excerpt: "Excerpt",
        id: "20000000-0000-4000-8000-000000000001",
        publishedAt: null,
        slug: "example-post",
        state: "draft",
        title: "Example post",
        updatedAt: new Date("2026-08-17T09:00:00.000Z"),
      }).updatedAt,
    ).toBe("2026-08-17T09:00:00.000Z");
  });
});

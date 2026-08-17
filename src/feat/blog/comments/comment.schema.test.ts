import { describe, expect, test } from "bun:test";

import { CommentDatabaseDomainSchema } from "./comment.schema";

describe("comment database boundary", () => {
  test("adapts view Dates before enforcing the shared domain", () => {
    expect(
      CommentDatabaseDomainSchema.parse({
        authorId: "00000000-0000-4000-8000-000000000001",
        body: "Comment",
        createdAt: new Date("2026-08-17T08:00:00.000Z"),
        id: "30000000-0000-4000-8000-000000000001",
        postId: "20000000-0000-4000-8000-000000000001",
        state: "published",
        updatedAt: new Date("2026-08-17T09:00:00.000Z"),
      }).createdAt,
    ).toBe("2026-08-17T08:00:00.000Z");
  });
});

import { describe, expect, test } from "bun:test";

import {
  CreatePostModelSchema,
  PostDomainSchema,
  PostListQuerySchema,
} from "./post.dto";

const authorId = "00000000-0000-4000-8000-000000000001";

describe("post DTOs", () => {
  test("defaults and bounds list queries", () => {
    expect(PostListQuerySchema.parse({})).toEqual({
      pagination: { page: 1, take: 12 },
    });
    expect(() =>
      PostListQuerySchema.parse({ pagination: { page: 1, take: 51 } }),
    ).toThrow();
  });

  test("separates write models from JSON-safe response domains", () => {
    expect(
      CreatePostModelSchema.parse({
        authorId,
        body: "The first program.",
        excerpt: "A short history.",
        slug: "analytical-engine",
        title: "The Analytical Engine",
      }).state,
    ).toBe("draft");

    expect(
      PostDomainSchema.parse({
        authorId,
        body: "The first program.",
        createdAt: "2026-08-17T08:00:00.000Z",
        excerpt: "A short history.",
        id: "20000000-0000-4000-8000-000000000001",
        publishedAt: null,
        slug: "analytical-engine",
        state: "draft",
        title: "The Analytical Engine",
        updatedAt: "2026-08-17T09:00:00.000Z",
      }),
    ).toMatchObject({
      createdAt: "2026-08-17T08:00:00.000Z",
      publishedAt: null,
      updatedAt: "2026-08-17T09:00:00.000Z",
    });
  });
});

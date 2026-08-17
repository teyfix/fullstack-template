import { describe, expect, test } from "bun:test";

import { CommentDomainSchema, CreateCommentModelSchema } from "./comment.dto";

describe("comment DTOs", () => {
  test("validates writes and serializes response dates", () => {
    const model = {
      authorId: "00000000-0000-4000-8000-000000000001",
      body: "A thoughtful comment.",
      postId: "20000000-0000-4000-8000-000000000001",
    };

    const parsedModel = CreateCommentModelSchema.parse(model);
    expect(String(parsedModel.authorId)).toBe(model.authorId);
    expect(parsedModel.body).toBe(model.body);
    expect(parsedModel.postId).toBe(model.postId);
    expect(
      CommentDomainSchema.parse({
        ...model,
        createdAt: "2026-08-17T08:00:00.000Z",
        id: "30000000-0000-4000-8000-000000000001",
        state: "published",
        updatedAt: "2026-08-17T09:00:00.000Z",
      }),
    ).toMatchObject({
      createdAt: "2026-08-17T08:00:00.000Z",
      updatedAt: "2026-08-17T09:00:00.000Z",
    });
  });
});

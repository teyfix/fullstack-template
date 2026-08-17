import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { UserIdSchema } from "~/kernel/identity/identity";

import { CommentCard } from "./comment.card";
import type { CommentDomain } from "./comment.dto";

const comment = {
  authorId: UserIdSchema.parse("11111111-1111-4111-8111-111111111111"),
  body: "This boundary keeps the dependency one-way.",
  createdAt: "2026-08-17T10:00:00.000Z",
  id: "22222222-2222-4222-8222-222222222222",
  postId: "33333333-3333-4333-8333-333333333333",
  state: "published",
  updatedAt: "2026-08-17T10:00:00.000Z",
} satisfies CommentDomain;

describe("CommentCard", () => {
  test("presents the byline as the comment heading", () => {
    render(() => <CommentCard byline="Ada · today" comment={comment} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Ada · today" }),
    ).toBeInTheDocument();
    expect(screen.getByText(comment.body)).toBeInTheDocument();
  });
});

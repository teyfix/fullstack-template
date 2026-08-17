import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";

import { UserIdSchema } from "~/kernel/identity/identity";
import type { CommentDomain } from "./comment.dto";
import { CommentList } from "./comment-list";

const comment = {
  authorId: UserIdSchema.parse("11111111-1111-4111-8111-111111111111"),
  body: "This boundary keeps the dependency one-way.",
  createdAt: "2026-08-17T10:00:00.000Z",
  id: "22222222-2222-4222-8222-222222222222",
  postId: "33333333-3333-4333-8333-333333333333",
  state: "published",
  updatedAt: "2026-08-17T10:00:00.000Z",
} satisfies CommentDomain;

describe("CommentList", () => {
  test("renders its empty branch", () => {
    render(() => (
      <CommentList
        byline={() => "Unused"}
        emptyLabel="No comments yet."
        items={[]}
        title="Comments"
      />
    ));

    expect(
      screen.getByRole("heading", { level: 2, name: "Comments" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  test("renders a byline for every comment", () => {
    const byline = vi.fn(() => "Ada · today");
    render(() => (
      <CommentList
        byline={byline}
        emptyLabel="No comments yet."
        items={[comment]}
        title="Comments"
      />
    ));

    expect(
      screen.getByRole("heading", { level: 2, name: "Ada · today" }),
    ).toBeInTheDocument();
    expect(byline).toHaveBeenCalledWith(comment);
    expect(screen.queryByText("No comments yet.")).not.toBeInTheDocument();
  });
});

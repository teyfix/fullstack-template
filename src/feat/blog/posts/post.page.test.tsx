import { render, screen } from "@solidjs/testing-library";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/solid-router";
import { describe, expect, test } from "vitest";

import { UserIdSchema } from "~/kernel/identity/identity";

import type { CommentDomain } from "../comments/comment.dto";
import type { PostDomain } from "./post.dto";
import { PostPage } from "./post.page";

const authorId = UserIdSchema.parse("11111111-1111-4111-8111-111111111111");

const post = {
  authorId,
  body: "The provider stays independent from its consumers.",
  createdAt: "2026-08-17T10:00:00.000Z",
  excerpt: "Keep feature dependencies explicit.",
  id: "22222222-2222-4222-8222-222222222222",
  publishedAt: "2026-08-17T10:00:00.000Z",
  slug: "feature-boundaries",
  state: "published",
  title: "Feature boundaries",
  updatedAt: "2026-08-17T10:00:00.000Z",
} satisfies PostDomain;

const comment = {
  authorId,
  body: "This reads naturally.",
  createdAt: "2026-08-17T11:00:00.000Z",
  id: "33333333-3333-4333-8333-333333333333",
  postId: post.id,
  state: "published",
  updatedAt: "2026-08-17T11:00:00.000Z",
} satisfies CommentDomain;

describe("PostPage", () => {
  test("composes post detail, navigation, and comments", () => {
    const router = createRouter({
      history: createMemoryHistory({
        initialEntries: ["/blog/feature-boundaries"],
      }),
      routeTree: createRootRoute(),
    });

    render(() => (
      <RouterContextProvider router={router}>
        {() => (
          <PostPage
            backLabel="Back to journal"
            commentByline={() => "Ada · today"}
            comments={[comment]}
            commentsEmptyLabel="No comments yet."
            commentsTitle="Comments"
            post={post}
          />
        )}
      </RouterContextProvider>
    ));

    expect(
      screen.getByRole("heading", { level: 1, name: post.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(post.body)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to journal" }),
    ).toHaveAttribute("href", "/blog");
    expect(
      screen.getByRole("heading", { level: 2, name: "Comments" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Ada · today" }),
    ).toBeInTheDocument();
  });
});

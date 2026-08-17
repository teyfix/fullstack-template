import { render, screen } from "@solidjs/testing-library";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/solid-router";
import { describe, expect, test } from "vitest";

import { UserIdSchema } from "~/kernel/identity/identity";

import type { PostSummaryDomain } from "./post.dto";
import { PostSummaryCard } from "./post-summary.card";

const post = {
  authorId: UserIdSchema.parse("11111111-1111-4111-8111-111111111111"),
  excerpt: "Keep feature dependencies explicit.",
  id: "22222222-2222-4222-8222-222222222222",
  publishedAt: "2026-08-17T10:00:00.000Z",
  slug: "feature-boundaries",
  title: "Feature boundaries",
} satisfies PostSummaryDomain;

describe("PostSummaryCard", () => {
  test("links a post title and excerpt to its detail URL", () => {
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: createRootRoute(),
    });

    render(() => (
      <RouterContextProvider router={router}>
        {() => <PostSummaryCard post={post} readLabel="Read post" />}
      </RouterContextProvider>
    ));

    expect(
      screen.getByRole("heading", { level: 2, name: post.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(post.excerpt)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read post" })).toHaveAttribute(
      "href",
      "/blog/feature-boundaries",
    );
  });
});

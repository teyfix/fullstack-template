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
import { PostListPage } from "./post-list.page";

const post = {
  authorId: UserIdSchema.parse("11111111-1111-4111-8111-111111111111"),
  excerpt: "Keep feature dependencies explicit.",
  id: "22222222-2222-4222-8222-222222222222",
  publishedAt: "2026-08-17T10:00:00.000Z",
  slug: "feature-boundaries",
  title: "Feature boundaries",
} satisfies PostSummaryDomain;

const copy = {
  description: "Notes about maintainable applications.",
  emptyLabel: "No published posts yet.",
  readLabel: "Read post",
  resultLabel: "1 post",
  title: "Journal",
};

describe("PostListPage", () => {
  test("renders the empty state instead of post cards", () => {
    render(() => <PostListPage {...copy} items={[]} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Journal" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No published posts yet.")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Read post" }),
    ).not.toBeInTheDocument();
  });

  test("renders each published post", () => {
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
      routeTree: createRootRoute(),
    });

    render(() => (
      <RouterContextProvider router={router}>
        {() => <PostListPage {...copy} items={[post]} />}
      </RouterContextProvider>
    ));

    expect(
      screen.getByRole("heading", { level: 2, name: post.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read post" })).toHaveAttribute(
      "href",
      "/blog/feature-boundaries",
    );
    expect(screen.queryByText(copy.emptyLabel)).not.toBeInTheDocument();
  });
});

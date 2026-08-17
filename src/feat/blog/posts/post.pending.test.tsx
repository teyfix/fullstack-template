import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import { PostListPending, PostPending } from "./post.pending";

describe("blog pending states", () => {
  test("labels the post-list loading status", () => {
    render(() => <PostListPending />);

    expect(
      screen.getByRole("status", { name: "Loading posts" }),
    ).toBeInTheDocument();
  });

  test("labels the post-detail loading status", () => {
    render(() => <PostPending />);

    expect(
      screen.getByRole("status", { name: "Loading post" }),
    ).toBeInTheDocument();
  });
});

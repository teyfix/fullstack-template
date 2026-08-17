import { describe, expect, test } from "vitest";

import { adminNavigation, publicNavigation } from "./blog.navigation";

describe("blog navigation", () => {
  test("contributes public and administration destinations", () => {
    expect(publicNavigation.map(({ id }) => id)).toEqual(["blog.home"]);
    expect(adminNavigation.map(({ id }) => id)).toEqual([
      "blog.posts",
      "blog.comments",
    ]);
    expect(
      [...publicNavigation, ...adminNavigation].every(
        ({ component }) => typeof component === "function",
      ),
    ).toBe(true);
  });
});

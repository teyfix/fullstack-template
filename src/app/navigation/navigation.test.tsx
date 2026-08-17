import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";

import {
  Navigation,
  type NavigationContribution,
  orderNavigationContributions,
} from "./navigation";

function contribution(id: string, order: number): NavigationContribution {
  return { component: () => id, id, order };
}

describe("Navigation", () => {
  test("orders contributions by order and stable id", () => {
    expect(
      orderNavigationContributions([
        contribution("comments", 20),
        contribution("posts", 10),
        contribution("about", 10),
      ]).map(({ id }) => id),
    ).toEqual(["about", "posts", "comments"]);
  });

  test("renders application and feature items in an accessible wrapper", () => {
    render(() => (
      <Navigation
        ariaLabel="Primary"
        contributions={[contribution("Blog", 20), contribution("Login", 10)]}
      >
        Home
      </Navigation>
    ));

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toHaveTextContent("HomeLoginBlog");
  });
});

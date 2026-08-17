import { describe, expect, test } from "vitest";

import { adminNavigation, publicNavigation } from "./auth.navigation";

describe("auth navigation", () => {
  test("contributes sign-in and identity administration links", () => {
    expect(publicNavigation.map(({ id }) => id)).toEqual(["auth.sign-in"]);
    expect(adminNavigation.map(({ id }) => id)).toEqual([
      "auth.users",
      "auth.sessions",
    ]);
    expect(
      [...publicNavigation, ...adminNavigation].every(
        ({ component }) => typeof component === "function",
      ),
    ).toBe(true);
  });
});

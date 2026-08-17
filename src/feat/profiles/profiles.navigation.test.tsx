import { describe, expect, test } from "vitest";

import { adminNavigation } from "./profiles.navigation";

describe("profiles navigation", () => {
  test("contributes the profile administration destination", () => {
    expect(adminNavigation.map(({ id }) => id)).toEqual(["profiles.list"]);
    expect(typeof adminNavigation[0]?.component).toBe("function");
  });
});

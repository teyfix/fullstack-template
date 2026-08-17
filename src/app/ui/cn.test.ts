import { describe, expect, test } from "bun:test";

import { cn } from "./cn";

describe("cn", () => {
  test("combines conditional classes", () => {
    expect(cn("grid", false && "hidden", { "gap-2": true })).toBe("grid gap-2");
  });

  test("lets the last conflicting Tailwind utility win", () => {
    expect(cn("p-2 text-sm", "p-4")).toBe("text-sm p-4");
  });
});

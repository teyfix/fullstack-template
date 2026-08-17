import { describe, expect, test } from "bun:test";

import { ProfileHandleQuerySchema } from "./profile";

describe("public profile contract", () => {
  test("validates handles without exposing persistence types", () => {
    expect(ProfileHandleQuerySchema.parse({ handle: "ada-lovelace" })).toEqual({
      handle: "ada-lovelace",
    });
    expect(() =>
      ProfileHandleQuerySchema.parse({ handle: "Ada Lovelace" }),
    ).toThrow();
  });
});

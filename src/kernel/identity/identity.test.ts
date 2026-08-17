import { describe, expect, test } from "bun:test";

import { IdentityDomainSchema, UserIdSchema } from "./identity";

describe("identity contract", () => {
  test("brands UUIDs without exposing an auth provider", () => {
    const id = UserIdSchema.parse("00000000-0000-4000-8000-000000000001");

    expect(
      IdentityDomainSchema.parse({ id, image: null, name: "Ada Lovelace" }),
    ).toEqual({ id, image: null, name: "Ada Lovelace" });
    expect(() => UserIdSchema.parse("better-auth-user-1")).toThrow();
  });
});

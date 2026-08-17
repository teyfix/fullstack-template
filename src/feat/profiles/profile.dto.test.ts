import { describe, expect, test } from "bun:test";

import { ProfileDomainSchema, ProfileHandleQuerySchema } from "./profile.dto";

describe("profile DTOs", () => {
  test("validates request queries and JSON-safe response domains", () => {
    expect(ProfileHandleQuerySchema.parse({ handle: "ada-lovelace" })).toEqual({
      handle: "ada-lovelace",
    });
    expect(
      ProfileDomainSchema.parse({
        bio: null,
        createdAt: "2026-08-17T08:00:00.000Z",
        displayName: "Ada Lovelace",
        handle: "ada-lovelace",
        id: "10000000-0000-4000-8000-000000000001",
        updatedAt: "2026-08-17T09:00:00.000Z",
        userId: "00000000-0000-4000-8000-000000000001",
      }),
    ).toMatchObject({
      createdAt: "2026-08-17T08:00:00.000Z",
      updatedAt: "2026-08-17T09:00:00.000Z",
    });
  });
});

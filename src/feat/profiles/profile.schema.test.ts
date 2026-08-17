import { describe, expect, test } from "bun:test";

import { ProfileDatabaseDomainSchema } from "./profile.schema";

describe("profile database boundary", () => {
  test("adapts database Dates to the client-safe domain", () => {
    expect(
      ProfileDatabaseDomainSchema.parse({
        bio: null,
        createdAt: new Date("2026-08-17T08:00:00.000Z"),
        displayName: "Ada Lovelace",
        handle: "ada-lovelace",
        id: "10000000-0000-4000-8000-000000000001",
        updatedAt: new Date("2026-08-17T09:00:00.000Z"),
        userId: "00000000-0000-4000-8000-000000000001",
      }).createdAt,
    ).toBe("2026-08-17T08:00:00.000Z");
  });
});

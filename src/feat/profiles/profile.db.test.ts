import { describe, expect, test } from "bun:test";
import { formatQuery } from "@teyfix/drizzle/render";

import { UserIdSchema } from "~/kernel/identity/identity";

import {
  createProfileByHandleQuery,
  createProfileByUserIdQuery,
} from "./profile.db";

describe("profile queries", () => {
  test("compiles the reviewed active-view lookup", async () => {
    const expectedSQL = await Bun.file(
      new URL("./profile.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createProfileByHandleQuery({
      params: { handle: "ada-lovelace" },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });

  test("compiles the reviewed active profile lookup by user", async () => {
    const expectedSQL = await Bun.file(
      new URL("./profile-by-user-id.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createProfileByUserIdQuery({
      params: {
        userId: UserIdSchema.parse("00000000-0000-4000-8000-000000000001"),
      },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

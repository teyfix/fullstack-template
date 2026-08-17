import { describe, expect, test } from "bun:test";
import { formatQuery } from "@teyfix/drizzle/render";

import { createUserByIdQuery, createUsersByIdsQuery } from "./user.db";

describe("auth identity adapter", () => {
  test("compiles against the provider-owned user table", async () => {
    const expectedSQL = await Bun.file(
      new URL("./user.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createUserByIdQuery({
      params: { id: "00000000-0000-4000-8000-000000000001" },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });

  test("compiles the reviewed multi-user identity lookup", async () => {
    const expectedSQL = await Bun.file(
      new URL("./users-by-ids.db.test.sql", import.meta.url),
    ).text();
    const generatedSQL = createUsersByIdsQuery({
      params: {
        ids: [
          "00000000-0000-4000-8000-000000000001",
          "00000000-0000-4000-8000-000000000002",
        ],
      },
      searchParams: {},
    }).toSQL().sql;

    expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  });
});

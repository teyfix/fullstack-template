import { describe, expect, test } from "bun:test";
import { getTableName } from "drizzle-orm";

import { authDatabaseSchema, authSchema } from "./auth.schema";

describe("generated auth schema", () => {
  test("reflects the Better Auth admin plugin in its isolated schema", () => {
    expect(authSchema.schemaName).toBe("better_auth");
    expect(getTableName(authDatabaseSchema.user)).toBe("user");
    expect(authDatabaseSchema.user.banned).toBeDefined();
    expect(Object.keys(authDatabaseSchema).sort()).toEqual([
      "account",
      "session",
      "user",
      "verification",
    ]);
  });
});

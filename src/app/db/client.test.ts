import { describe, expect, test } from "bun:test";

import { db } from "./client";

describe("db", () => {
  test("exposes one application query surface", () => {
    expect(db).toHaveProperty("select");
    expect(db).toHaveProperty("transaction");
  });
});

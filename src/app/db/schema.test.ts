import { describe, expect, test } from "bun:test";

import { appSchema } from "./schema";

describe("appSchema", () => {
  test("uses the validated application name", () => {
    expect(appSchema.schemaName).toBe("journal");
  });
});

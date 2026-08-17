import { describe, expect, test } from "bun:test";

import { parseSharedConfig } from "./shared.config";

describe("parseSharedConfig", () => {
  test("nests a supported runtime environment", () => {
    expect(parseSharedConfig("test")).toEqual({
      runtime: { environment: "test" },
    });
  });

  test("does not guess a missing environment", () => {
    expect(() => parseSharedConfig(undefined)).toThrow();
  });
});

import { describe, expect, test } from "bun:test";

import { parseClientConfig } from "./client.config";

describe("parseClientConfig", () => {
  test("builds nested browser-safe configuration", () => {
    expect(parseClientConfig({ VITE_APP_NAME: "Teyfix Journal" })).toEqual({
      app: { name: "Teyfix Journal" },
    });
  });

  test("requires explicit public configuration", () => {
    expect(() => parseClientConfig({})).toThrow();
  });
});

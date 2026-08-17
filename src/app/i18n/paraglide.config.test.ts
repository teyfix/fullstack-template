import { describe, expect, test } from "bun:test";

import { paraglideOptions } from "./paraglide.config";

describe("paraglideOptions", () => {
  test("keeps canonical routes locale-neutral and localizes at the boundary", () => {
    expect(paraglideOptions.urlPatterns).toEqual([
      {
        localized: [
          ["en", "/en/:path(.*)?"],
          ["tr", "/tr/:path(.*)?"],
        ],
        pattern: "/:path(.*)?",
      },
    ]);
  });

  test("does not localize server functions or external API routes", () => {
    expect(paraglideOptions.routeStrategies).toEqual([
      { exclude: true, match: "/_server/:path(.*)?" },
      { exclude: true, match: "/api/:path(.*)?" },
    ]);
  });
});

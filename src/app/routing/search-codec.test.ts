import { describe, expect, test } from "bun:test";

import { parseRouterSearch, stringifyRouterSearch } from "./search-codec";

describe("router search codec", () => {
  test("parses dotted objects and comma arrays", () => {
    expect(
      parseRouterSearch(
        "?filters.tags=bun,solid&pagination.take=20&pagination.skip=40",
      ),
    ).toEqual({
      filters: { tags: ["bun", "solid"] },
      pagination: { skip: "40", take: "20" },
    });
  });

  test("round-trips nested search state and encoded literal commas", () => {
    const search = {
      filters: { tags: ["bun,typescript", "solid"] },
      pagination: { skip: 0, take: 20 },
    };

    const encoded = stringifyRouterSearch(search);

    expect(encoded).toBe(
      "?filters.tags=bun%2Ctypescript,solid&pagination.skip=0&pagination.take=20",
    );
    expect(parseRouterSearch(encoded)).toEqual({
      filters: { tags: ["bun,typescript", "solid"] },
      pagination: { skip: "0", take: "20" },
    });
  });

  test("does not add a question mark for empty state", () => {
    expect(stringifyRouterSearch({})).toBe("");
  });
});

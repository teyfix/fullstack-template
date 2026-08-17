import { describe, expect, test } from "bun:test";

import { orderProfileSections, type ProfileSection } from "./profile-section";

const section = (id: string, order: number): ProfileSection => ({
  id,
  order,
  render: () => null,
});

describe("profile sections", () => {
  test("orders contributions deterministically", () => {
    expect(
      orderProfileSections([
        section("comments", 20),
        section("posts", 10),
        section("about", 10),
      ]).map(({ id }) => id),
    ).toEqual(["about", "posts", "comments"]);
  });
});

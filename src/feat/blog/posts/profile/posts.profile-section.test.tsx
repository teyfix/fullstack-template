import { describe, expect, test } from "vitest";

import { postsProfileSection, profileSections } from "./posts.profile-section";

describe("blog profile sections", () => {
  test("exports the posts section through the profiles contract", () => {
    expect(profileSections).toEqual([postsProfileSection]);
    expect(postsProfileSection.id).toBe("blog.posts");
    expect(typeof postsProfileSection.render).toBe("function");
  });
});

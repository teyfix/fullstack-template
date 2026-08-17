import { describe, expect, test } from "bun:test";

import { commentSeedModels, postSeedModels, seed } from "./blog.seed";

describe("blog seed", () => {
  test("keeps the related fixture graph deterministic", () => {
    expect(seed).toBeFunction();
    expect(commentSeedModels[0]?.postId).toBe(postSeedModels[0]?.id);
    expect(postSeedModels[0]?.state).toBe("published");
  });
});

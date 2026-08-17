import { describe, expect, test } from "bun:test";

import { profileSeedModels, seed } from "./profiles.seed";

describe("profile seed", () => {
  test("is deterministic and exposes the standard seed entry point", () => {
    expect(seed).toBeFunction();
    expect(profileSeedModels).toHaveLength(1);
    expect(profileSeedModels[0]?.handle).toBe("ada-lovelace");
  });
});

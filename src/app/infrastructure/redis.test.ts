import { describe, expect, test } from "bun:test";
import { RedisClient } from "bun";

import { createRedis } from "./redis";

describe("createRedis", () => {
  test("creates Bun's native Redis client without third-party transport", () => {
    expect(createRedis("redis://localhost:6379")).toBeInstanceOf(RedisClient);
  });
});

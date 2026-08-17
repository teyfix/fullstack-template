import "@tanstack/solid-start/server-only";

import { RedisClient } from "bun";

import { ServerConfig } from "~/app/config/server.config";

export function createRedis(url: string): RedisClient {
  return new RedisClient(url);
}

/** Bun-native Redis client, initialized only from server-reachable modules. */
export const redis = createRedis(ServerConfig.redis.url);

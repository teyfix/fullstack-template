import "@tanstack/solid-start/server-only";

import { SQL } from "bun";

import { ServerConfig } from "~/app/config/server.config";

export function createPostgres(url: string): SQL {
  return new SQL(url);
}

/** Bun-native pooled runtime transport; migrations use POSTGRES_ADMIN_URL. */
export const postgres = createPostgres(ServerConfig.postgres.url);

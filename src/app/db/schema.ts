import "@tanstack/solid-start/server-only";

import * as d from "drizzle-orm/pg-core";

import { ServerConfig } from "~/app/config/server.config";

/** Feature-owned domain tables, views, enums, and sequences share this schema. */
export const appSchema = d.snakeCase.schema(ServerConfig.app.name);

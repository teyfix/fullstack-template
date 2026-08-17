import "@tanstack/solid-start/server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start/solid";

import { ServerConfig } from "~/app/config/server.config";
import { db } from "~/app/db/client";

import { authDatabaseSchema } from "./auth.schema";

/** Better Auth owns its generated schema; application migrations only consume it. */
export const auth = betterAuth({
  advanced: { database: { generateId: "uuid", joins: true } },
  appName: ServerConfig.app.name,
  baseURL: ServerConfig.auth.url,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authDatabaseSchema,
    schemaName: "better_auth",
  }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({ adminUserIds: ServerConfig.auth.adminUserIds }),
    tanstackStartCookies(),
  ],
  secret: ServerConfig.auth.secret,
});

export type AuthSession = typeof auth.$Infer.Session;

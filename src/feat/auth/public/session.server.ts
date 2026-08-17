import "@tanstack/solid-start/server-only";

import { getRequestHeaders } from "@tanstack/solid-start/server";

import { ServerConfig } from "~/app/config/server.config";

import { auth } from "../auth";
import { createSessionAuthorizer } from "../session-authorizer";

const authorizer = createSessionAuthorizer(
  async (headers) => await auth.api.getSession({ headers }),
  { adminUserIds: ServerConfig.auth.adminUserIds },
);

/** Public auth capability for feature-owned protected server functions. */
export async function requireAdminSession() {
  return await authorizer.requireAdmin(new Headers(getRequestHeaders()));
}

/** Public auth capability for feature-owned authenticated server functions. */
export async function requireSession() {
  return await authorizer.requireSession(new Headers(getRequestHeaders()));
}

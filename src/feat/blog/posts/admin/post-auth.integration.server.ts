import "@tanstack/solid-start/server-only";

import { requireAdminSession } from "~/feat/auth/public/session.server";
import { UserIdSchema } from "~/kernel/identity/identity";

/** Explicit one-way integration: blog admin consumes auth; auth never sees blog. */
export async function currentAdminAuthorId() {
  const session = await requireAdminSession();
  return UserIdSchema.parse(session.user.id);
}

export async function authorizeBlogAdministration() {
  const session = await requireAdminSession();
  return { id: session.user.id, name: session.user.name };
}

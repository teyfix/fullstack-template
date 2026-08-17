import "@tanstack/solid-start/server-only";

import { requireAdminSession } from "~/feat/auth/public/session.server";

/** Explicit one-way authorization edge; auth remains independent of profiles. */
export async function authorizeProfileAdministration() {
  const session = await requireAdminSession();
  return { id: session.user.id, name: session.user.name };
}

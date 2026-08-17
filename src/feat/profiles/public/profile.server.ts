import "@tanstack/solid-start/server-only";

import { fetchProfileByHandleDomain } from "../profile.db";
import type { ProfileHandleQuery } from "./profile";

/** Stable public read capability; the profiles feature retains query ownership. */
export async function findProfileByHandle({
  params,
  searchParams,
}: Readonly<{
  params: ProfileHandleQuery;
  searchParams: Record<string, never>;
}>) {
  return await fetchProfileByHandleDomain({ params, searchParams });
}

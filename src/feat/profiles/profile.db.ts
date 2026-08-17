import "@tanstack/solid-start/server-only";

import { eq, type Placeholder, sql } from "drizzle-orm";

import { db } from "~/app/db/client";
import type { UserId } from "~/kernel/identity/identity";

import type { ProfileHandleQuery } from "./profile.dto";
import { ProfileDatabaseDomainSchema } from "./profile.schema";
import { activeProfile } from "./profile.views";

type ProfileByHandleQueryOptions = Readonly<{
  params: { handle: Placeholder | string };
  searchParams: Record<string, never>;
}>;

type ProfileByUserIdQueryOptions = Readonly<{
  params: { userId: Placeholder | UserId };
  searchParams: Record<string, never>;
}>;

export function createProfileByHandleQuery({
  params,
}: ProfileByHandleQueryOptions) {
  return db
    .select()
    .from(activeProfile)
    .where(eq(activeProfile.handle, params.handle))
    .limit(1);
}

export function createProfileByUserIdQuery({
  params,
}: ProfileByUserIdQueryOptions) {
  return db
    .select()
    .from(activeProfile)
    .where(eq(activeProfile.userId, params.userId))
    .limit(1);
}

const profileByHandleStatement = createProfileByHandleQuery({
  params: { handle: sql.placeholder("handle") },
  searchParams: {},
}).prepare("profile_by_handle");

const profileByUserIdStatement = createProfileByUserIdQuery({
  params: { userId: sql.placeholder("userId") },
  searchParams: {},
}).prepare("profile_by_user_id");

export async function fetchProfileByHandleDomain({
  params,
}: Readonly<{
  params: ProfileHandleQuery;
  searchParams: Record<string, never>;
}>) {
  const row = (await profileByHandleStatement.execute(params))[0];
  return row === undefined ? null : ProfileDatabaseDomainSchema.parse(row);
}

export async function fetchProfileByUserIdDomain({
  params,
}: Readonly<{
  params: { userId: UserId };
  searchParams: Record<string, never>;
}>) {
  const row = (await profileByUserIdStatement.execute(params))[0];
  return row === undefined ? null : ProfileDatabaseDomainSchema.parse(row);
}

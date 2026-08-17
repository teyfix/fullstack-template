import "@tanstack/solid-start/server-only";

import { asc, eq, inArray, type Placeholder, sql } from "drizzle-orm";

import { db } from "~/app/db/client";
import {
  type IdentityDirectory,
  IdentityDomainSchema,
  type UserId,
} from "~/kernel/identity/identity";

import { user } from "../auth.schema";

type UserByIdQueryOptions = Readonly<{
  params: { id: Placeholder | string };
  searchParams: Record<string, never>;
}>;

type UsersByIdsQueryOptions = Readonly<{
  params: { ids: readonly string[] };
  searchParams: Record<string, never>;
}>;

export function createUserByIdQuery({ params }: UserByIdQueryOptions) {
  return db
    .select({ id: user.id, image: user.image, name: user.name })
    .from(user)
    .where(eq(user.id, params.id))
    .limit(1);
}

export function createUsersByIdsQuery({ params }: UsersByIdsQueryOptions) {
  return db
    .select({ id: user.id, image: user.image, name: user.name })
    .from(user)
    .where(inArray(user.id, [...params.ids]))
    .orderBy(asc(user.id));
}

const userByIdStatement = createUserByIdQuery({
  params: { id: sql.placeholder("id") },
  searchParams: {},
}).prepare("auth_user_identity_by_id");

export const authIdentityDirectory: IdentityDirectory = {
  async findById(id) {
    const row = (await userByIdStatement.execute({ id }))[0];
    return row === undefined ? null : IdentityDomainSchema.parse(row);
  },
  async findByIds(ids) {
    if (ids.length === 0) return new Map();
    const rows = await createUsersByIdsQuery({
      params: { ids },
      searchParams: {},
    });
    return new Map(
      rows.map((row) => {
        const domain = IdentityDomainSchema.parse(row);
        return [domain.id, domain] as const;
      }),
    ) as ReadonlyMap<UserId, ReturnType<typeof IdentityDomainSchema.parse>>;
  },
};

import "@tanstack/solid-start/server-only";

import { getTableColumns, isNull } from "drizzle-orm";

import { appSchema } from "~/app/db/schema";

import { profile } from "./profile.tables";

const { deletedAt: _deletedAt, ...activeProfileColumns } =
  getTableColumns(profile);

/** Public read model; consumers cannot forget the soft-delete predicate. */
export const activeProfile = appSchema
  .view("active_profile")
  .as((query) =>
    query
      .select(activeProfileColumns)
      .from(profile)
      .where(isNull(profile.deletedAt)),
  );

import "@tanstack/solid-start/server-only";

import { identityColumns, timestampColumns } from "@teyfix/drizzle/pg";
import * as d from "drizzle-orm/pg-core";

import { appSchema } from "~/app/db/schema";

export const profile = appSchema.table(
  "profile",
  {
    ...identityColumns(),
    bio: d.text(),
    displayName: d.text().notNull(),
    handle: d.text().notNull().unique(),
    userId: d.uuid().notNull().unique(),
    ...timestampColumns(),
  },
  (table) => [d.index("profile_user_id_idx").on(table.userId)],
);

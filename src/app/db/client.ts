import "@tanstack/solid-start/server-only";

import { drizzle } from "drizzle-orm/bun-sql";

import { postgres } from "~/app/infrastructure/postgres";
import { authRelations } from "~/feat/auth/auth.generated";

/** The single application-owned Drizzle database instance. */
export const db = drizzle({
  client: postgres,
  relations: { ...authRelations },
});

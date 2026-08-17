import "@tanstack/solid-start/server-only";

import {
  account,
  authRelations,
  betterAuthSchema,
  session,
  user,
  verification,
} from "./auth.generated";

/** Better Auth CLI-owned schema. Regenerate after changing auth plugins. */
export const authSchema = betterAuthSchema;

export const authDatabaseSchema = { account, session, user, verification };

export { account, authRelations, session, user, verification };

import "@tanstack/solid-start/server-only";

import { authIdentityDirectory } from "~/feat/auth/users/user.db";
import type { IdentityDirectory } from "~/kernel/identity/identity";

/** Application composition is the only place that selects an identity provider. */
export const identityDirectory: IdentityDirectory = authIdentityDirectory;

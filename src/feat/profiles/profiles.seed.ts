import "@tanstack/solid-start/server-only";

import { db } from "~/app/db/client";

import { profile } from "./profile.tables";

export const profileSeedModels = [
  {
    bio: "Mathematician, writer, and the first computer programmer.",
    displayName: "Ada Lovelace",
    handle: "ada-lovelace",
    id: "10000000-0000-4000-8000-000000000001",
    userId: "00000000-0000-4000-8000-000000000001",
  },
] as const;

/** Idempotent feature seed discovered by the application seed runner. */
export async function seed(): Promise<void> {
  await db
    .insert(profile)
    .values([...profileSeedModels])
    .onConflictDoNothing();
}

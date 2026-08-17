import "@tanstack/solid-start/server-only";

import { db } from "~/app/db/client";

import { comment } from "./comments/comment.tables";
import { post } from "./posts/post.tables";

export const postSeedModels = [
  {
    authorId: "00000000-0000-4000-8000-000000000001",
    body: "A small, deletion-safe feature can still model a complete vertical slice.",
    excerpt: "Why feature ownership matters in a full-stack template.",
    id: "20000000-0000-4000-8000-000000000001",
    publishedAt: new Date("2026-08-17T08:00:00.000Z"),
    slug: "features-that-leave-cleanly",
    state: "published" as const,
    title: "Features That Leave Cleanly",
  },
] as const;

export const commentSeedModels = [
  {
    authorId: "00000000-0000-4000-8000-000000000001",
    body: "The ownership rule makes deletion an architectural test.",
    id: "30000000-0000-4000-8000-000000000001",
    postId: "20000000-0000-4000-8000-000000000001",
    state: "published" as const,
  },
] as const;

/** Idempotent feature seed; post and comment ownership disappears together. */
export async function seed(): Promise<void> {
  await db
    .insert(post)
    .values([...postSeedModels])
    .onConflictDoNothing();
  await db
    .insert(comment)
    .values([...commentSeedModels])
    .onConflictDoNothing();
}

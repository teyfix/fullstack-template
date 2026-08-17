import "@tanstack/solid-start/server-only";

import { and, asc, eq, type Placeholder, sql } from "drizzle-orm";

import { db } from "~/app/db/client";

import type { CommentListQuery } from "./comment.dto";
import { CommentDatabaseDomainSchema } from "./comment.schema";
import { activeComment } from "./comment.views";

type PublishedCommentListQueryOptions = Readonly<{
  params: { postId: Placeholder | string };
  searchParams: Record<string, never>;
}>;

export function createPublishedCommentListQuery({
  params,
}: PublishedCommentListQueryOptions) {
  return db
    .select()
    .from(activeComment)
    .where(
      and(
        eq(activeComment.postId, params.postId),
        eq(activeComment.state, "published"),
      ),
    )
    .orderBy(asc(activeComment.createdAt), asc(activeComment.id));
}

const publishedCommentListStatement = createPublishedCommentListQuery({
  params: { postId: sql.placeholder("postId") },
  searchParams: {},
}).prepare("published_blog_comments_by_post");

export async function fetchPublishedCommentListDomain({
  params,
}: Readonly<{
  params: CommentListQuery;
  searchParams: Record<string, never>;
}>) {
  const rows = await publishedCommentListStatement.execute(params);
  return rows.map((row) => CommentDatabaseDomainSchema.parse(row));
}

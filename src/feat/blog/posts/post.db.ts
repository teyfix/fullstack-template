import "@tanstack/solid-start/server-only";

import { and, desc, eq, type Placeholder, sql } from "drizzle-orm";

import { db } from "~/app/db/client";

import type { CreatePostModel, PostListQuery, PostSlugQuery } from "./post.dto";
import {
  PostDatabaseDomainSchema,
  PostSummaryDatabaseDomainSchema,
} from "./post.schema";
import { post } from "./post.tables";
import { activePost } from "./post.views";

type PublishedPostListQueryOptions = Readonly<{
  params: Record<string, never>;
  searchParams: {
    pagination: {
      offset: number | Placeholder;
      take: number | Placeholder;
    };
  };
}>;

type PublishedPostBySlugQueryOptions = Readonly<{
  params: { slug: Placeholder | string };
  searchParams: Record<string, never>;
}>;

type PublishedPostListByAuthorQueryOptions = Readonly<{
  params: { authorId: Placeholder | string };
  searchParams: Record<string, never>;
}>;

export function createPublishedPostListQuery({
  searchParams,
}: PublishedPostListQueryOptions) {
  return db
    .select({
      authorId: activePost.authorId,
      excerpt: activePost.excerpt,
      id: activePost.id,
      publishedAt: activePost.publishedAt,
      slug: activePost.slug,
      title: activePost.title,
    })
    .from(activePost)
    .where(eq(activePost.state, "published"))
    .orderBy(desc(activePost.publishedAt), desc(activePost.id))
    .limit(searchParams.pagination.take)
    .offset(searchParams.pagination.offset);
}

export function createPublishedPostBySlugQuery({
  params,
}: PublishedPostBySlugQueryOptions) {
  return db
    .select()
    .from(activePost)
    .where(
      and(eq(activePost.slug, params.slug), eq(activePost.state, "published")),
    )
    .limit(1);
}

export function createPublishedPostListByAuthorQuery({
  params,
}: PublishedPostListByAuthorQueryOptions) {
  return db
    .select({
      authorId: activePost.authorId,
      excerpt: activePost.excerpt,
      id: activePost.id,
      publishedAt: activePost.publishedAt,
      slug: activePost.slug,
      title: activePost.title,
    })
    .from(activePost)
    .where(
      and(
        eq(activePost.authorId, params.authorId),
        eq(activePost.state, "published"),
      ),
    )
    .orderBy(desc(activePost.publishedAt), desc(activePost.id))
    .limit(12);
}

const publishedPostListByAuthorStatement = createPublishedPostListByAuthorQuery(
  {
    params: { authorId: sql.placeholder("authorId") },
    searchParams: {},
  },
).prepare("published_blog_posts_by_author");

const publishedPostListStatement = createPublishedPostListQuery({
  params: {},
  searchParams: {
    pagination: {
      offset: sql.placeholder("offset"),
      take: sql.placeholder("take"),
    },
  },
}).prepare("published_blog_posts");

const publishedPostBySlugStatement = createPublishedPostBySlugQuery({
  params: { slug: sql.placeholder("slug") },
  searchParams: {},
}).prepare("published_blog_post_by_slug");

export async function fetchPublishedPostListDomain({
  searchParams,
}: Readonly<{
  params: Record<string, never>;
  searchParams: PostListQuery;
}>) {
  const rows = await publishedPostListStatement.execute({
    offset: (searchParams.pagination.page - 1) * searchParams.pagination.take,
    take: searchParams.pagination.take,
  });
  return rows.map((row) => PostSummaryDatabaseDomainSchema.parse(row));
}

export async function fetchPublishedPostDomain({
  params,
}: Readonly<{
  params: PostSlugQuery;
  searchParams: Record<string, never>;
}>) {
  const row = (await publishedPostBySlugStatement.execute(params))[0];
  return row === undefined ? null : PostDatabaseDomainSchema.parse(row);
}

export async function fetchPublishedPostsByAuthorDomain({
  params,
}: Readonly<{
  params: { authorId: string };
  searchParams: Record<string, never>;
}>) {
  const rows = await publishedPostListByAuthorStatement.execute(params);
  return rows.map((row) => PostSummaryDatabaseDomainSchema.parse(row));
}

export async function insertPostDomain({
  model,
}: Readonly<{ model: CreatePostModel }>) {
  const row = (
    await db
      .insert(post)
      .values({
        ...model,
        publishedAt: model.state === "published" ? new Date() : null,
      })
      .returning()
  )[0];
  if (row === undefined) throw new Error("Post insert returned no row");
  return PostDatabaseDomainSchema.parse(row);
}

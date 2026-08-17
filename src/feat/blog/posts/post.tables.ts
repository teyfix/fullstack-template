import "@tanstack/solid-start/server-only";

import {
  identityColumns,
  timestamp,
  timestampColumns,
} from "@teyfix/drizzle/pg";
import * as d from "drizzle-orm/pg-core";

import { appSchema } from "~/app/db/schema";

export const postState = appSchema.enum("blog_post_state", [
  "draft",
  "published",
]);

export const post = appSchema.table(
  "blog_post",
  {
    ...identityColumns(),
    authorId: d.uuid().notNull(),
    body: d.text().notNull(),
    excerpt: d.text().notNull(),
    publishedAt: timestamp("published_at"),
    slug: d.text().notNull().unique(),
    state: postState().notNull().default("draft"),
    title: d.text().notNull(),
    ...timestampColumns(),
  },
  (table) => [
    d.index("blog_post_author_id_idx").on(table.authorId),
    d.index("blog_post_published_at_idx").on(table.publishedAt),
  ],
);

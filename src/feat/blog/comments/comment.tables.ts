import "@tanstack/solid-start/server-only";

import { identityColumns, timestampColumns } from "@teyfix/drizzle/pg";
import * as d from "drizzle-orm/pg-core";

import { appSchema } from "~/app/db/schema";

import { post } from "../posts/post.tables";

export const commentState = appSchema.enum("blog_comment_state", [
  "pending",
  "published",
  "rejected",
]);

export const comment = appSchema.table(
  "blog_comment",
  {
    ...identityColumns(),
    authorId: d.uuid().notNull(),
    body: d.text().notNull(),
    postId: d
      .uuid()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    state: commentState().notNull().default("pending"),
    ...timestampColumns(),
  },
  (table) => [
    d.index("blog_comment_author_id_idx").on(table.authorId),
    d.index("blog_comment_post_id_idx").on(table.postId),
  ],
);

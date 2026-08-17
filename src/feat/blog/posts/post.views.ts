import "@tanstack/solid-start/server-only";

import { getTableColumns, isNull } from "drizzle-orm";

import { appSchema } from "~/app/db/schema";

import { post } from "./post.tables";

const { deletedAt: _deletedAt, ...activePostColumns } = getTableColumns(post);

export const activePost = appSchema
  .view("active_blog_post")
  .as((query) =>
    query.select(activePostColumns).from(post).where(isNull(post.deletedAt)),
  );

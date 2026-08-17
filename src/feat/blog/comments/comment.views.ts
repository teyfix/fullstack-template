import "@tanstack/solid-start/server-only";

import { getTableColumns, isNull } from "drizzle-orm";

import { appSchema } from "~/app/db/schema";

import { comment } from "./comment.tables";

const { deletedAt: _deletedAt, ...activeCommentColumns } =
  getTableColumns(comment);

export const activeComment = appSchema
  .view("active_blog_comment")
  .as((query) =>
    query
      .select(activeCommentColumns)
      .from(comment)
      .where(isNull(comment.deletedAt)),
  );

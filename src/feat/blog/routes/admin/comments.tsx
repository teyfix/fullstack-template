import { createFileRoute } from "@tanstack/solid-router";
import {
  "blog.comments.admin.list.description" as blogCommentsAdminListDescription,
  "blog.comments.admin.list.title" as blogCommentsAdminListTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppPending } from "~/app/ui/feedback";

import { CommentAdminPage } from "../../comments/admin/comment-admin.page";
import { fetchBlogAdminIdentity } from "../../posts/admin/blog-admin.functions";

export const Route = createFileRoute("/admin/comments")({
  component: BlogCommentsAdminRoute,
  errorComponent: AppErrorBoundary,
  loader: () => fetchBlogAdminIdentity({ data: {} }),
  pendingComponent: AppPending,
});

function BlogCommentsAdminRoute() {
  return (
    <CommentAdminPage
      description={blogCommentsAdminListDescription()}
      title={blogCommentsAdminListTitle()}
    />
  );
}

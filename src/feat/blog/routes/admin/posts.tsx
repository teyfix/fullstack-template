import { createFileRoute } from "@tanstack/solid-router";
import {
  "blog.posts.admin.list.bodyLabel" as blogPostsAdminListBodyLabel,
  "blog.posts.admin.list.create" as blogPostsAdminListCreate,
  "blog.posts.admin.list.description" as blogPostsAdminListDescription,
  "blog.posts.admin.list.excerptLabel" as blogPostsAdminListExcerptLabel,
  "blog.posts.admin.list.saved" as blogPostsAdminListSaved,
  "blog.posts.admin.list.slugLabel" as blogPostsAdminListSlugLabel,
  "blog.posts.admin.list.submit" as blogPostsAdminListSubmit,
  "blog.posts.admin.list.title" as blogPostsAdminListTitle,
  "blog.posts.admin.list.titleLabel" as blogPostsAdminListTitleLabel,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary } from "~/app/ui/feedback";

import { fetchBlogAdminIdentity } from "../../posts/admin/blog-admin.functions";
import { PostAdminPage } from "../../posts/admin/post-admin.page";
import { PostAdminPending } from "../../posts/admin/post-admin.pending";

export const Route = createFileRoute("/admin/posts")({
  component: BlogAdminRoute,
  errorComponent: AppErrorBoundary,
  loader: () => fetchBlogAdminIdentity({ data: {} }),
  pendingComponent: PostAdminPending,
});

function BlogAdminRoute() {
  return (
    <PostAdminPage
      bodyLabel={blogPostsAdminListBodyLabel()}
      createLabel={blogPostsAdminListCreate()}
      description={blogPostsAdminListDescription()}
      excerptLabel={blogPostsAdminListExcerptLabel()}
      savedLabel={blogPostsAdminListSaved()}
      slugLabel={blogPostsAdminListSlugLabel()}
      submitLabel={blogPostsAdminListSubmit()}
      title={blogPostsAdminListTitle()}
      titleLabel={blogPostsAdminListTitleLabel()}
    />
  );
}

import { createFileRoute } from "@tanstack/solid-router";
import {
  "blog.posts.list.description" as blogPostsListDescription,
  "blog.posts.list.empty" as blogPostsListEmpty,
  "blog.posts.list.read" as blogPostsListRead,
  "blog.posts.list.resultCount" as blogPostsListResultCount,
  "blog.posts.list.title" as blogPostsListTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary } from "~/app/ui/feedback";

import { PostListQuerySchema } from "../../../posts/post.dto";
import { fetchPublishedPosts } from "../../../posts/post.functions";
import { PostListPending } from "../../../posts/post.pending";
import { PostListPage } from "../../../posts/post-list.page";

export const Route = createFileRoute("/blog/")({
  component: BlogIndexRoute,
  errorComponent: AppErrorBoundary,
  loader: ({ deps }) => fetchPublishedPosts({ data: deps }),
  loaderDeps: ({ search }) => search,
  pendingComponent: PostListPending,
  validateSearch: (search) => PostListQuerySchema.parse(search),
});

function BlogIndexRoute() {
  const posts = Route.useLoaderData();
  return (
    <PostListPage
      description={blogPostsListDescription()}
      emptyLabel={blogPostsListEmpty()}
      items={posts()}
      readLabel={blogPostsListRead()}
      resultLabel={blogPostsListResultCount({ count: posts().length })}
      title={blogPostsListTitle()}
    />
  );
}

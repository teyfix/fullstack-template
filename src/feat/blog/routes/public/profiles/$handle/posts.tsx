import { createFileRoute, notFound } from "@tanstack/solid-router";
import {
  "blog.posts.list.read" as blogPostsListRead,
  "blog.posts.profile.section.empty" as blogPostsProfileSectionEmpty,
  "blog.posts.profile.section.title" as blogPostsProfileSectionTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppNotFound } from "~/app/ui/feedback";
import { fetchProfilePosts } from "../../../../posts/post.functions";
import { PostListPending } from "../../../../posts/post.pending";
import { PostsProfilePage } from "../../../../posts/profile/posts-profile.page";

export const Route = createFileRoute("/profiles/$handle/posts")({
  component: ProfilePostsRoute,
  errorComponent: AppErrorBoundary,
  loader: async ({ params }) => {
    const page = await fetchProfilePosts({ data: { handle: params.handle } });
    if (page === null) throw notFound();
    return page;
  },
  notFoundComponent: AppNotFound,
  pendingComponent: PostListPending,
});

function ProfilePostsRoute() {
  const page = Route.useLoaderData();
  return (
    <PostsProfilePage
      emptyLabel={blogPostsProfileSectionEmpty()}
      posts={page().posts}
      profile={page().profile}
      readLabel={blogPostsListRead()}
      title={blogPostsProfileSectionTitle()}
    />
  );
}

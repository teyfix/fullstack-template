import { createFileRoute, notFound } from "@tanstack/solid-router";
import {
  "blog.comments.list.byline" as blogCommentsListByline,
  "blog.comments.list.empty" as blogCommentsListEmpty,
  "blog.posts.detail.back" as blogPostsDetailBack,
  "blog.posts.detail.comments" as blogPostsDetailComments,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppNotFound } from "~/app/ui/feedback";
import { fetchPublishedPostPage } from "../../../posts/post.functions";
import { PostPage } from "../../../posts/post.page";
import { PostPending } from "../../../posts/post.pending";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostRoute,
  errorComponent: AppErrorBoundary,
  loader: async ({ params }) => {
    const page = await fetchPublishedPostPage({ data: { slug: params.slug } });
    if (page === null) throw notFound();
    return page;
  },
  notFoundComponent: AppNotFound,
  pendingComponent: PostPending,
});

function BlogPostRoute() {
  const page = Route.useLoaderData();
  return (
    <PostPage
      backLabel={blogPostsDetailBack()}
      commentByline={(comment) =>
        blogCommentsListByline({
          author: page().authors[comment.authorId]?.name ?? comment.authorId,
        })
      }
      comments={page().comments}
      commentsEmptyLabel={blogCommentsListEmpty()}
      commentsTitle={blogPostsDetailComments()}
      post={page().post}
    />
  );
}

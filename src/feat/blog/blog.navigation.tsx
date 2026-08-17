import { Link } from "@tanstack/solid-router";

import type { NavigationContribution } from "~/app/navigation/navigation";
import {
  navigationLinkActiveClass,
  navigationLinkClass,
} from "~/app/navigation/navigation";
import {
  "blog.navigation.blog" as blogNavigationBlog,
  "blog.navigation.comments" as blogNavigationComments,
  "blog.navigation.posts" as blogNavigationPosts,
} from "~/app/paraglide/messages.js";

function BlogNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/blog"
    >
      {blogNavigationBlog()}
    </Link>
  );
}

function PostsNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/admin/posts"
    >
      {blogNavigationPosts()}
    </Link>
  );
}

function CommentsNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/admin/comments"
    >
      {blogNavigationComments()}
    </Link>
  );
}

export const publicNavigation = [
  { component: BlogNavigationLink, id: "blog.home", order: 20 },
] as const satisfies readonly NavigationContribution[];

export const adminNavigation = [
  { component: PostsNavigationLink, id: "blog.posts", order: 40 },
  { component: CommentsNavigationLink, id: "blog.comments", order: 50 },
] as const satisfies readonly NavigationContribution[];

import { createServerFn } from "@tanstack/solid-start";

import { identityDirectory } from "~/app/composition/identity.server";
import { ProfileHandleQuerySchema } from "~/feat/profiles/public/profile";
import { findProfileByHandle } from "~/feat/profiles/public/profile.server";

import { fetchPublishedCommentListDomain } from "../comments/comment.db";
import { currentAdminAuthorId } from "./admin/post-auth.integration.server";
import {
  fetchPublishedPostDomain,
  fetchPublishedPostListDomain,
  fetchPublishedPostsByAuthorDomain,
  insertPostDomain,
} from "./post.db";
import {
  AdminCreatePostModelSchema,
  PostListQuerySchema,
  PostSlugQuerySchema,
} from "./post.dto";

export const fetchPublishedPosts = createServerFn({ method: "GET" })
  .validator(PostListQuerySchema)
  .handler(async ({ data }) => {
    return await fetchPublishedPostListDomain({
      params: {},
      searchParams: data,
    });
  });

export const fetchPublishedPostPage = createServerFn({ method: "GET" })
  .validator(PostSlugQuerySchema)
  .handler(async ({ data }) => {
    const post = await fetchPublishedPostDomain({
      params: data,
      searchParams: {},
    });
    if (post === null) return null;

    const comments = await fetchPublishedCommentListDomain({
      params: { postId: post.id },
      searchParams: {},
    });
    const authors = await identityDirectory.findByIds([
      post.authorId,
      ...comments.map(({ authorId }) => authorId),
    ]);
    return {
      authors: Object.fromEntries(authors),
      comments,
      post,
    };
  });

export const fetchProfilePosts = createServerFn({ method: "GET" })
  .validator(ProfileHandleQuerySchema)
  .handler(async ({ data }) => {
    const profile = await findProfileByHandle({
      params: data,
      searchParams: {},
    });
    if (profile === null) return null;
    return {
      posts: await fetchPublishedPostsByAuthorDomain({
        params: { authorId: profile.userId },
        searchParams: {},
      }),
      profile,
    };
  });

export const createPost = createServerFn({ method: "POST" })
  .validator(AdminCreatePostModelSchema)
  .handler(async ({ data }) => {
    return await insertPostDomain({
      model: {
        ...data,
        authorId: await currentAdminAuthorId(),
      },
    });
  });

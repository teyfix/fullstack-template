import {
  "blog.posts.detail.loading" as blogPostsDetailLoading,
  "blog.posts.list.loading" as blogPostsListLoading,
} from "~/app/paraglide/messages.js";
import { Container, Stack } from "~/app/ui/layout";
import { Skeleton } from "~/app/ui/skeleton";

export function PostListPending() {
  return (
    <Container aria-label={blogPostsListLoading()} class="py-12" role="status">
      <Stack>
        <Skeleton class="h-12 w-2/5" />
        <Skeleton class="h-5 w-3/5" />
        <Skeleton class="h-44 w-full" />
        <Skeleton class="h-44 w-full" />
      </Stack>
    </Container>
  );
}

export function PostPending() {
  return (
    <Container
      aria-label={blogPostsDetailLoading()}
      class="py-12"
      role="status"
    >
      <Stack>
        <Skeleton class="h-12 w-3/4" />
        <Skeleton class="h-5 w-1/2" />
        <Skeleton class="h-72 w-full" />
      </Stack>
    </Container>
  );
}

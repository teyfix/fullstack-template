import { "blog.posts.admin.list.loading" as blogPostsAdminListLoading } from "~/app/paraglide/messages.js";
import { Container, Stack } from "~/app/ui/layout";
import { Skeleton } from "~/app/ui/skeleton";

export function PostAdminPending() {
  return (
    <Container
      aria-label={blogPostsAdminListLoading()}
      class="py-12"
      role="status"
    >
      <Stack>
        <Skeleton class="h-12 w-2/5" />
        <Skeleton class="h-96 w-full" />
      </Stack>
    </Container>
  );
}

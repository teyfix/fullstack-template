import { For, Show } from "solid-js";

import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";
import type { ProfileDomain } from "~/feat/profiles/public/profile";

import type { PostSummaryDomain } from "../post.dto";
import { PostSummaryCard } from "../post-summary.card";

export type PostsProfilePageProps = Readonly<{
  emptyLabel: string;
  posts: readonly PostSummaryDomain[];
  profile: ProfileDomain;
  readLabel: string;
  title: string;
}>;

export function PostsProfilePage(props: PostsProfilePageProps) {
  return (
    <Container class="py-12">
      <Stack>
        <Heading level={1}>
          {props.title}: {props.profile.displayName}
        </Heading>
        <Show
          when={props.posts.length > 0}
          fallback={<Text>{props.emptyLabel}</Text>}
        >
          <Stack>
            <For each={props.posts}>
              {(post) => (
                <PostSummaryCard post={post} readLabel={props.readLabel} />
              )}
            </For>
          </Stack>
        </Show>
      </Stack>
    </Container>
  );
}

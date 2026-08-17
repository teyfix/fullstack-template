import { For, Show } from "solid-js";

import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

import type { PostSummaryDomain } from "./post.dto";
import { PostSummaryCard } from "./post-summary.card";

export type PostListPageProps = Readonly<{
  description: string;
  emptyLabel: string;
  items: readonly PostSummaryDomain[];
  readLabel: string;
  resultLabel: string;
  title: string;
}>;

export function PostListPage(props: PostListPageProps) {
  return (
    <Container class="py-12">
      <Stack>
        <Stack class="gap-2">
          <Heading level={1}>{props.title}</Heading>
          <Text>{props.description}</Text>
          <Text>{props.resultLabel}</Text>
        </Stack>
        <Show
          when={props.items.length > 0}
          fallback={<Text>{props.emptyLabel}</Text>}
        >
          <Stack>
            <For each={props.items}>
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

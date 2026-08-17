import { For, Show } from "solid-js";

import { Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";
import { CommentCard } from "./comment.card";
import type { CommentDomain } from "./comment.dto";

export type CommentListProps = Readonly<{
  byline: (comment: CommentDomain) => string;
  emptyLabel: string;
  items: readonly CommentDomain[];
  title: string;
}>;

export function CommentList(props: CommentListProps) {
  return (
    <Stack>
      <Heading>{props.title}</Heading>
      <Show
        when={props.items.length > 0}
        fallback={<Text>{props.emptyLabel}</Text>}
      >
        <For each={props.items}>
          {(comment) => (
            <CommentCard byline={props.byline(comment)} comment={comment} />
          )}
        </For>
      </Show>
    </Stack>
  );
}

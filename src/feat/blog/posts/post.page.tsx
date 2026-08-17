import { Link } from "@tanstack/solid-router";

import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

import type { CommentDomain } from "../comments/comment.dto";
import { CommentList } from "../comments/comment-list";
import type { PostDomain } from "./post.dto";

export type PostPageProps = Readonly<{
  backLabel: string;
  commentByline: (comment: CommentDomain) => string;
  comments: readonly CommentDomain[];
  commentsEmptyLabel: string;
  commentsTitle: string;
  post: PostDomain;
}>;

export function PostPage(props: PostPageProps) {
  return (
    <Container class="py-12">
      <Stack>
        <Link
          class="font-medium text-primary text-sm underline-offset-4 hover:underline"
          to="/blog"
        >
          {props.backLabel}
        </Link>
        <Stack class="gap-3">
          <Heading level={1}>{props.post.title}</Heading>
          <Text>{props.post.excerpt}</Text>
          <Text class="whitespace-pre-wrap text-foreground">
            {props.post.body}
          </Text>
        </Stack>
        <CommentList
          byline={props.commentByline}
          emptyLabel={props.commentsEmptyLabel}
          items={props.comments}
          title={props.commentsTitle}
        />
      </Stack>
    </Container>
  );
}

import { Link } from "@tanstack/solid-router";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/app/ui/card";
import { Text } from "~/app/ui/typography";

import type { PostSummaryDomain } from "./post.dto";

export type PostSummaryCardProps = Readonly<{
  post: PostSummaryDomain;
  readLabel: string;
}>;

export function PostSummaryCard({ post, readLabel }: PostSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text>{post.excerpt}</Text>
      </CardContent>
      <CardFooter>
        <Link
          class="font-medium text-primary text-sm underline-offset-4 hover:underline"
          params={{ slug: post.slug }}
          to="/blog/$slug"
        >
          {readLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}

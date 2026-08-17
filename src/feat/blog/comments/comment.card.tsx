import { Card, CardContent, CardHeader, CardTitle } from "~/app/ui/card";
import { Text } from "~/app/ui/typography";

import type { CommentDomain } from "./comment.dto";

export type CommentCardProps = Readonly<{
  byline: string;
  comment: CommentDomain;
}>;

export function CommentCard({ byline, comment }: CommentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{byline}</CardTitle>
      </CardHeader>
      <CardContent>
        <Text>{comment.body}</Text>
      </CardContent>
    </Card>
  );
}

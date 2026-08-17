import { Card, CardContent, CardHeader } from "~/app/ui/card";
import { Container } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

export type CommentAdminPageProps = Readonly<{
  description: string;
  title: string;
}>;

export function CommentAdminPage(props: CommentAdminPageProps) {
  return (
    <Container class="py-12">
      <Card>
        <CardHeader>
          <Heading level={1}>{props.title}</Heading>
        </CardHeader>
        <CardContent>
          <Text>{props.description}</Text>
        </CardContent>
      </Card>
    </Container>
  );
}

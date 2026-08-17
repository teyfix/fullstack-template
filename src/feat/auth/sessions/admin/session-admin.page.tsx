import { Card, CardContent, CardHeader } from "~/app/ui/card";
import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

export type SessionAdminPageProps = Readonly<{
  description: string;
  emptyLabel: string;
  title: string;
}>;

export function SessionAdminPage(props: SessionAdminPageProps) {
  return (
    <Container class="py-12">
      <Card>
        <CardHeader>
          <Heading level={1}>{props.title}</Heading>
        </CardHeader>
        <CardContent>
          <Stack>
            <Text>{props.description}</Text>
            <Text>{props.emptyLabel}</Text>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

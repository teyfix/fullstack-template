import { Card, CardContent, CardHeader } from "~/app/ui/card";
import { Container, Stack } from "~/app/ui/layout";
import { Heading, Text } from "~/app/ui/typography";

export type ProfileAdminPageProps = Readonly<{
  description: string;
  title: string;
}>;

export function ProfileAdminPage(props: ProfileAdminPageProps) {
  return (
    <Container class="py-12">
      <Card>
        <CardHeader>
          <Heading level={1}>{props.title}</Heading>
        </CardHeader>
        <CardContent>
          <Stack>
            <Text>{props.description}</Text>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

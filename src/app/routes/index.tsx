import { createFileRoute } from "@tanstack/solid-router";

import {
  "common.home.cardBody" as commonHomeCardBody,
  "common.home.cardDescription" as commonHomeCardDescription,
  "common.home.cardTitle" as commonHomeCardTitle,
  "common.home.description" as commonHomeDescription,
  "common.home.title" as commonHomeTitle,
} from "../paraglide/messages.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Container, Stack } from "../ui/layout";
import { Heading, Text } from "../ui/typography";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <Container class="py-16">
      <Stack class="gap-10">
        <Stack class="max-w-3xl">
          <Heading level={1}>{commonHomeTitle()}</Heading>
          <Text class="text-lg">{commonHomeDescription()}</Text>
        </Stack>
        <Card class="max-w-2xl">
          <CardHeader>
            <CardTitle>{commonHomeCardTitle()}</CardTitle>
            <CardDescription>{commonHomeCardDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>{commonHomeCardBody()}</Text>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

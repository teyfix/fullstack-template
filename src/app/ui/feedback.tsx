import type { ErrorComponentProps } from "@tanstack/solid-router";

import {
  "common.error.description" as commonErrorDescription,
  "common.error.retry" as commonErrorRetry,
  "common.error.title" as commonErrorTitle,
  "common.loading.label" as commonLoadingLabel,
  "common.not-found.description" as commonNotFoundDescription,
  "common.not-found.title" as commonNotFoundTitle,
} from "../paraglide/messages.js";
import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";
import { Container, Stack } from "./layout";
import { Skeleton } from "./skeleton";
import { Heading, Text } from "./typography";

export function AppPending() {
  return (
    <Container aria-label={commonLoadingLabel()} class="py-12" role="status">
      <Stack>
        <Skeleton class="h-10 w-2/5" />
        <Skeleton class="h-5 w-3/5" />
        <Skeleton class="h-48 w-full" />
      </Stack>
    </Container>
  );
}

export function AppNotFound() {
  return (
    <Container class="py-16">
      <Card class="mx-auto max-w-xl">
        <CardHeader>
          <Heading level={1}>{commonNotFoundTitle()}</Heading>
        </CardHeader>
        <CardContent>
          <Text>{commonNotFoundDescription()}</Text>
        </CardContent>
      </Card>
    </Container>
  );
}

/** Hides internal failure details while retaining the router retry path. */
export function AppErrorBoundary(props: ErrorComponentProps) {
  return (
    <Container class="py-16">
      <Card class="mx-auto max-w-xl">
        <CardHeader>
          <Heading level={1}>{commonErrorTitle()}</Heading>
        </CardHeader>
        <CardContent>
          <Stack>
            <Text>{commonErrorDescription()}</Text>
            <Button onClick={props.reset}>{commonErrorRetry()}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

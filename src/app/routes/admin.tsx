import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { Navigation } from "../navigation/navigation";
import { adminNavigation } from "../navigation.generated";
import {
  "common.admin.description" as commonAdminDescription,
  "common.admin.navigationLabel" as commonAdminNavigationLabel,
  "common.admin.title" as commonAdminTitle,
} from "../paraglide/messages.js";
import { Container, Stack } from "../ui/layout";
import { Heading, Text } from "../ui/typography";

export const Route = createFileRoute("/admin")({ component: AdminShell });

function AdminShell() {
  return (
    <Container class="py-12">
      <Stack>
        <Stack class="gap-2">
          <Heading level={1}>{commonAdminTitle()}</Heading>
          <Text>{commonAdminDescription()}</Text>
        </Stack>
        <Navigation
          ariaLabel={commonAdminNavigationLabel()}
          contributions={adminNavigation}
        />
        <Outlet />
      </Stack>
    </Container>
  );
}

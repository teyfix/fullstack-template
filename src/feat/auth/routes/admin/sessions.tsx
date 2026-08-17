import { createFileRoute } from "@tanstack/solid-router";

import {
  "auth.sessions.admin.list.description" as authSessionsAdminListDescription,
  "auth.sessions.admin.list.empty" as authSessionsAdminListEmpty,
  "auth.sessions.admin.list.title" as authSessionsAdminListTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppPending } from "~/app/ui/feedback";

import { fetchAdminIdentity } from "../../admin.functions";
import { SessionAdminPage } from "../../sessions/admin/session-admin.page";

export const Route = createFileRoute("/admin/sessions")({
  component: SessionsAdminRoute,
  errorComponent: AppErrorBoundary,
  loader: () => fetchAdminIdentity({ data: {} }),
  pendingComponent: AppPending,
});

function SessionsAdminRoute() {
  return (
    <SessionAdminPage
      description={authSessionsAdminListDescription()}
      emptyLabel={authSessionsAdminListEmpty()}
      title={authSessionsAdminListTitle()}
    />
  );
}

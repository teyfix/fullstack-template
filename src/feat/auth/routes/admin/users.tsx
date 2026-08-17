import { createFileRoute } from "@tanstack/solid-router";

import {
  "auth.users.admin.list.description" as authUsersAdminListDescription,
  "auth.users.admin.list.empty" as authUsersAdminListEmpty,
  "auth.users.admin.list.title" as authUsersAdminListTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppPending } from "~/app/ui/feedback";

import { fetchAdminIdentity } from "../../admin.functions";
import { UserAdminPage } from "../../users/admin/user-admin.page";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdminRoute,
  errorComponent: AppErrorBoundary,
  loader: () => fetchAdminIdentity({ data: {} }),
  pendingComponent: AppPending,
});

function UsersAdminRoute() {
  return (
    <UserAdminPage
      description={authUsersAdminListDescription()}
      emptyLabel={authUsersAdminListEmpty()}
      title={authUsersAdminListTitle()}
    />
  );
}

import { createFileRoute } from "@tanstack/solid-router";

import {
  "profiles.admin.list.description" as profilesAdminListDescription,
  "profiles.admin.list.title" as profilesAdminListTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppPending } from "~/app/ui/feedback";

import { fetchProfileAdminIdentity } from "../../admin/profile-admin.functions";
import { ProfileAdminPage } from "../../admin/profile-admin.page";

export const Route = createFileRoute("/admin/profiles")({
  component: ProfilesAdminRoute,
  errorComponent: AppErrorBoundary,
  loader: () => fetchProfileAdminIdentity({ data: {} }),
  pendingComponent: AppPending,
});

function ProfilesAdminRoute() {
  return (
    <ProfileAdminPage
      description={profilesAdminListDescription()}
      title={profilesAdminListTitle()}
    />
  );
}

import { createFileRoute, notFound } from "@tanstack/solid-router";

import {
  "profiles.page.about" as profilesPageAbout,
  "profiles.page.title" as profilesPageTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppNotFound, AppPending } from "~/app/ui/feedback";
import { fetchProfile } from "../../../profile.functions";
import { ProfilePage } from "../../../profile.page";

export const Route = createFileRoute("/profiles/$handle")({
  component: ProfileRoute,
  errorComponent: AppErrorBoundary,
  loader: async ({ params }) => {
    const profile = await fetchProfile({ data: { handle: params.handle } });
    if (profile === null) throw notFound();
    return profile;
  },
  notFoundComponent: AppNotFound,
  pendingComponent: AppPending,
});

function ProfileRoute() {
  const profile = Route.useLoaderData();
  return (
    <ProfilePage
      aboutLabel={profilesPageAbout()}
      profile={profile()}
      title={profilesPageTitle()}
    />
  );
}

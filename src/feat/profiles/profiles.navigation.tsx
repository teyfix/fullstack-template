import { Link } from "@tanstack/solid-router";

import type { NavigationContribution } from "~/app/navigation/navigation";
import {
  navigationLinkActiveClass,
  navigationLinkClass,
} from "~/app/navigation/navigation";
import { "profiles.navigation.profiles" as profilesNavigationProfiles } from "~/app/paraglide/messages.js";

function ProfilesNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/admin/profiles"
    >
      {profilesNavigationProfiles()}
    </Link>
  );
}

export const adminNavigation = [
  { component: ProfilesNavigationLink, id: "profiles.list", order: 30 },
] as const satisfies readonly NavigationContribution[];

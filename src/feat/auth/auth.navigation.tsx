import { Link } from "@tanstack/solid-router";

import type { NavigationContribution } from "~/app/navigation/navigation";
import {
  navigationLinkActiveClass,
  navigationLinkClass,
} from "~/app/navigation/navigation";
import {
  "auth.navigation.sessions" as authNavigationSessions,
  "auth.navigation.signIn" as authNavigationSignIn,
  "auth.navigation.users" as authNavigationUsers,
} from "~/app/paraglide/messages.js";

function SignInNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/login"
    >
      {authNavigationSignIn()}
    </Link>
  );
}

function UsersNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/admin/users"
    >
      {authNavigationUsers()}
    </Link>
  );
}

function SessionsNavigationLink() {
  return (
    <Link
      activeProps={{ class: navigationLinkActiveClass }}
      class={navigationLinkClass}
      to="/admin/sessions"
    >
      {authNavigationSessions()}
    </Link>
  );
}

export const publicNavigation = [
  { component: SignInNavigationLink, id: "auth.sign-in", order: 90 },
] as const satisfies readonly NavigationContribution[];

export const adminNavigation = [
  { component: UsersNavigationLink, id: "auth.users", order: 10 },
  { component: SessionsNavigationLink, id: "auth.sessions", order: 20 },
] as const satisfies readonly NavigationContribution[];

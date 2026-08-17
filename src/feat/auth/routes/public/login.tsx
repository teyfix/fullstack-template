import { createFileRoute } from "@tanstack/solid-router";

import {
  "auth.login.page.description" as authLoginPageDescription,
  "auth.login.page.emailLabel" as authLoginPageEmailLabel,
  "auth.login.page.passwordLabel" as authLoginPagePasswordLabel,
  "auth.login.page.submit" as authLoginPageSubmit,
  "auth.login.page.title" as authLoginPageTitle,
} from "~/app/paraglide/messages.js";
import { AppErrorBoundary, AppPending } from "~/app/ui/feedback";

import { LoginPage } from "../../login/login.page";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
  errorComponent: AppErrorBoundary,
  pendingComponent: AppPending,
});

function LoginRoute() {
  return (
    <LoginPage
      description={authLoginPageDescription()}
      emailLabel={authLoginPageEmailLabel()}
      passwordLabel={authLoginPagePasswordLabel()}
      submitLabel={authLoginPageSubmit()}
      title={authLoginPageTitle()}
    />
  );
}

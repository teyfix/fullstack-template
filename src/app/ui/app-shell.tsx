import { Link } from "@tanstack/solid-router";
import type { JSX } from "solid-js";

import { ClientConfig } from "../config/client.config";
import {
  Navigation,
  navigationLinkActiveClass,
  navigationLinkClass,
} from "../navigation/navigation";
import { publicNavigation } from "../navigation.generated";
import {
  "common.footer.description" as commonFooterDescription,
  "common.header.admin" as commonHeaderAdmin,
  "common.header.home" as commonHeaderHome,
  "common.header.navigationLabel" as commonHeaderNavigationLabel,
} from "../paraglide/messages.js";
import { Container } from "./layout";

export type AppShellProps = Readonly<{
  children: JSX.Element;
}>;

/** Feature-neutral application chrome; feature navigation is composed elsewhere. */
export function AppShell(props: AppShellProps) {
  return (
    <div class="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <header class="border-b bg-card/80 backdrop-blur">
        <Container class="flex min-h-16 items-center justify-between gap-6">
          <Link class="font-semibold font-serif text-xl" to="/">
            {ClientConfig.app.name}
          </Link>
          <Navigation
            ariaLabel={commonHeaderNavigationLabel()}
            contributions={publicNavigation}
          >
            <Link
              activeProps={{ class: navigationLinkActiveClass }}
              class={navigationLinkClass}
              to="/"
            >
              {commonHeaderHome()}
            </Link>
            <Link
              activeProps={{ class: navigationLinkActiveClass }}
              class={navigationLinkClass}
              to="/admin"
            >
              {commonHeaderAdmin()}
            </Link>
          </Navigation>
        </Container>
      </header>
      <main>{props.children}</main>
      <footer class="border-t py-6 text-muted-foreground text-sm">
        <Container>
          {commonFooterDescription({ appName: ClientConfig.app.name })}
        </Container>
      </footer>
    </div>
  );
}

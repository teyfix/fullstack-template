import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";
import {
  orderProfileSections,
  ProfileSectionsContext,
} from "~/feat/profiles/public/profile-section";
import globalsCss from "~/theme/globals.css?url";

import { ClientConfig } from "../config/client.config";
import { getLocale } from "../paraglide/runtime.js";
import { profileSections } from "../profile-sections.generated";
import { AppShell } from "../ui/app-shell";

const orderedProfileSections = orderProfileSections(profileSections);

export const Route = createRootRoute({
  head: () => ({
    links: [{ href: globalsCss, rel: "stylesheet" }],
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: ClientConfig.app.name },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <html lang={getLocale()}>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body>
        <ProfileSectionsContext.Provider value={orderedProfileSections}>
          <AppShell>
            <Suspense>
              <Outlet />
            </Suspense>
          </AppShell>
        </ProfileSectionsContext.Provider>
        <Scripts />
      </body>
    </html>
  );
}

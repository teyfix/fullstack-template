import { createRouter } from "@tanstack/solid-router";
import { deLocalizeUrl, localizeUrl } from "./app/paraglide/runtime.js";
import {
  parseRouterSearch,
  stringifyRouterSearch,
} from "./app/routing/search-codec";
import { AppErrorBoundary, AppNotFound, AppPending } from "./app/ui/feedback";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    defaultErrorComponent: AppErrorBoundary,
    defaultNotFoundComponent: AppNotFound,
    defaultPendingComponent: AppPending,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    parseSearch: parseRouterSearch,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
    routeTree,
    scrollRestoration: true,
    stringifySearch: stringifyRouterSearch,
  });
}

declare module "@tanstack/solid-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

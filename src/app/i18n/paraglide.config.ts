import type { CompilerOptions } from "@inlang/paraglide-js";

/** Shared by the Vite plugin and the pre-typecheck compiler. */
export const paraglideOptions = {
  cookieName: "APP_LOCALE",
  emitTsDeclarations: true,
  outdir: "./src/app/paraglide",
  project: "./project.inlang",
  routeStrategies: [
    { exclude: true, match: "/_server/:path(.*)?" },
    { exclude: true, match: "/api/:path(.*)?" },
  ],
  strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
  urlPatterns: [
    {
      localized: [
        ["en", "/en/:path(.*)?"],
        ["tr", "/tr/:path(.*)?"],
      ],
      pattern: "/:path(.*)?",
    },
  ],
} satisfies CompilerOptions;

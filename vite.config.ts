import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import { paraglideOptions } from "./src/app/i18n/paraglide.config.ts";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    paraglideVitePlugin(paraglideOptions),
    nitro({ preset: "bun" }),
    tanstackStart({
      srcDirectory: "src",
      router: {
        generatedRouteTree: "routeTree.gen.ts",
        routesDirectory: ".",
        virtualRouteConfig: "./src/app/routes.generated.ts",
      },
    }),
    solid({ ssr: true }),
  ],
  server: {
    port: 3000,
  },
});

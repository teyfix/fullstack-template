import { fileURLToPath } from "node:url";

import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

const solidBrowserAliases = [
  {
    find: /^solid-js$/,
    replacement: fileURLToPath(
      new URL("./node_modules/solid-js/dist/solid.js", import.meta.url),
    ),
  },
  {
    find: /^solid-js\/web$/,
    replacement: fileURLToPath(
      new URL("./node_modules/solid-js/web/dist/web.js", import.meta.url),
    ),
  },
];

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: solidBrowserAliases,
    conditions: ["solid", "browser"],
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: [
      "drizzle/**/*.test.ts",
      "src/app/**/*.test.tsx",
      "src/feat/**/*.test.tsx",
    ],
    passWithNoTests: true,
    pool: "threads",
    server: {
      deps: {
        inline: ["@solidjs/testing-library", /solid-js/, "zod"],
      },
    },
    setupFiles: ["./test/setup.ts", "./test/setup-dom.ts"],
  },
});

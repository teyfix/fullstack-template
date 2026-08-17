import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solid()],
  resolve: {
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
    setupFiles: ["./test/setup.ts", "./test/setup-dom.ts"],
  },
});

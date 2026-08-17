import { defineConfig } from "drizzle-kit";

import { ServerConfig } from "./src/app/config/server.config";

export default defineConfig({
  dbCredentials: { url: ServerConfig.postgres.adminUrl },
  dialect: "postgresql",
  out: "./drizzle",
  schema: [
    "./src/app/db/schema.ts",
    "./src/feat/auth/auth.generated.ts",
    "./src/**/*.tables.ts",
    "./src/**/*.views.ts",
  ],
});

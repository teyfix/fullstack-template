import { describe, expect, test } from "bun:test";

const { default: config } = await import("./drizzle.config");

describe("drizzle.config", () => {
  test("discovers database artifacts inside removable feature folders", () => {
    expect(config.schema).toEqual([
      "./src/app/db/schema.ts",
      "./src/feat/auth/auth.generated.ts",
      "./src/**/*.tables.ts",
      "./src/**/*.views.ts",
    ]);
  });

  test("uses the direct administrative connection for migrations", () => {
    expect(config).toMatchObject({
      dbCredentials: {
        url: "postgresql://test:test@localhost:5432/test",
      },
    });
  });
});

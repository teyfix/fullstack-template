import { describe, expect, test } from "bun:test";

import { parseServerConfig } from "./server.config";

const validEnvironment = {
  APP_NAME: "journal",
  BETTER_AUTH_ADMIN_USER_IDS:
    "00000000-0000-4000-8000-000000000001, 00000000-0000-4000-8000-000000000002",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
  BETTER_AUTH_URL: "https://journal.example.test",
  IMGPROXY_KEY:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  IMGPROXY_SALT: "abcdef0123456789abcdef0123456789",
  IMGPROXY_URL: "https://imgproxy.journal.example.test",
  POSTGRES_ADMIN_URL: "postgresql://journal:secret@postgres.test/journal",
  POSTGRES_URL: "postgresql://journal:secret@pgbouncer.test/journal",
  REDIS_URL: "redis://redis.test:6379",
  S3_ACCESS_KEY: "journal",
  S3_BUCKET: "journal",
  S3_ENDPOINT: "https://s3.journal.example.test",
  S3_REGION: "us-east-1",
  S3_SECRET_KEY: "secret",
} as const;

describe("parseServerConfig", () => {
  test("maps flat deployment values into nested service configuration", () => {
    const config = parseServerConfig(validEnvironment);

    expect(config.postgres).toEqual({
      adminUrl: validEnvironment.POSTGRES_ADMIN_URL,
      url: validEnvironment.POSTGRES_URL,
    });
    expect(config.auth.adminUserIds).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
    ]);
    expect(config.s3.bucket).toBe("journal");
  });

  test("rejects missing endpoints instead of assuming local services", () => {
    expect(() => parseServerConfig({})).toThrow();
  });

  test("rejects an application name that is unsafe as a schema", () => {
    expect(() =>
      parseServerConfig({ ...validEnvironment, APP_NAME: "Journal App" }),
    ).toThrow("PostgreSQL-safe schema name");
  });
});

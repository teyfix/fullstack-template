import { describe, expect, test } from "bun:test";
import { $ } from "bun";

type ComposeService = Readonly<{
  build?: { additional_contexts?: Record<string, string> };
  command?: string[];
  environment?: Record<string, string>;
  healthcheck?: { test?: string[] };
  networks?: Record<string, unknown> | string[];
}>;

type ComposeDocument = Readonly<{ services: Record<string, ComposeService> }>;

async function readCompose(relativePath: string): Promise<ComposeDocument> {
  const source = await Bun.file(new URL(relativePath, import.meta.url)).text();
  return Bun.YAML.parse(source) as ComposeDocument;
}

describe("Compose boundaries", () => {
  test("keeps migrations direct while application queries use PgBouncer", async () => {
    const compose = await readCompose("app.yaml");

    expect(compose.services.migrate?.environment).toMatchObject({
      POSTGRES_ADMIN_URL: expect.stringContaining("@postgres.lokal:5432/"),
      POSTGRES_URL: expect.stringContaining("@postgres.lokal:5432/"),
    });
    expect(compose.services.app?.environment?.POSTGRES_URL).toContain(
      "@pgbouncer.lokal:5432/",
    );
    expect(compose.services.app?.networks).toHaveProperty("net-pgbouncer");
    expect(compose.services.app?.networks).not.toHaveProperty("net-postgres");
  });

  test("gives the local build an explicit standalone Drizzle context", async () => {
    const compose = await readCompose("app.yaml");
    expect(compose.services.app?.build?.additional_contexts).toEqual({
      drizzle: ["$", "{PWD}/../drizzle"].join(""),
    });
  });

  test("enables protocol-level prepared statements in transaction pooling", async () => {
    const compose = await readCompose("postgres.yaml");
    expect(compose.services.pgbouncer?.healthcheck?.test).toContain(
      "SELECT 1;",
    );

    const source = await Bun.file(
      new URL("postgres/pgbouncer/pgbouncer.ini", import.meta.url),
    ).text();
    expect(source).toContain("pool_mode = transaction");
    expect(source).toContain("max_prepared_statements = 200");
  });

  test("keeps the PgBouncer entrypoint shell-valid", async () => {
    const entrypoint = new URL(
      "postgres/pgbouncer/app/entrypoint.sh",
      import.meta.url,
    ).pathname;
    const result = await $`sh -n ${entrypoint}`.quiet().nothrow();
    expect(result.exitCode).toBe(0);
  });

  test("connects imgproxy privately to MinIO", async () => {
    const compose = await readCompose("imgproxy.yaml");
    expect(compose.services.imgproxy?.environment).toMatchObject({
      IMGPROXY_S3_ENDPOINT: "http://s3.lokal:9000",
      IMGPROXY_S3_ENDPOINT_USE_PATH_STYLE: "true",
      IMGPROXY_USE_S3: "true",
    });
    expect(compose.services.imgproxy?.networks).toHaveProperty("net-minio");
  });
});

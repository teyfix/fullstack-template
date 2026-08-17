---
description: Drizzle schemas, lifecycle views, auth ownership, queries, and migrations.
---

# Database

## Contents

- [Package boundary](#package-boundary)
- [Domain schema](#domain-schema)
- [Better Auth](#better-auth)
- [Queries and seeds](#queries-and-seeds)
- [Connections and migrations](#connections-and-migrations)
- [SQL fixtures](#sql-fixtures)

## Package boundary

- Import project-agnostic additions from explicit `@teyfix/drizzle` subpaths. Add new generic helpers and their tests in that sibling repository, not here.
- Import native Drizzle aggregates, operators, columns, and query APIs from `drizzle-orm`; never re-export them unchanged.
- Use `drizzle-orm/zod` for Drizzle schemas. Do not add `drizzle-zod`.

## Domain schema

- Domain tables, enums, views, and sequences use `appSchema`, created with `d.snakeCase.schema(ServerConfig.app.name)`.
- Use `import * as d from "drizzle-orm/pg-core"` only for PostgreSQL primitives.
- Every domain table has `id`, `createdAt`, `updatedAt`, and nullable `deletedAt` through `identityColumns()` and `timestampColumns()`.
- Pair every table with an active `*.views.ts` view that filters `deletedAt IS NULL` and omits `deletedAt` from its result shape. Normal reads use the view; writes use the table.
- Preserve `Date` and `bigint` inside persistence. Convert them to ISO and decimal strings only at JSON/server-function boundaries.

## Better Auth

- Better Auth and its plugins own `src/feat/auth/auth.generated.ts`. Never add domain lifecycle columns, active views, or application fields to it.
- After changing Better Auth configuration/plugins, run `bun run auth:generate`, then generate and review a named Drizzle migration.
- Bootstrap administrators through Better Auth and the validated comma-separated `BETTER_AUTH_ADMIN_USER_IDS` allowlist. Never update provider-owned auth rows with ad hoc SQL.
- Auth and application data use separate PostgreSQL schemas: `better_auth` and the validated `APP_NAME` schema.

## Queries and seeds

- Put feature queries and named prepared statements in a colocated `*.db.ts`; return closed `*Domain` values instead of Drizzle rows.
- Use the single application `db` instance. Do not pass it through feature function signatures or create per-feature clients.
- Feature-owned `*.seed.ts` modules are deterministic and idempotent; the generated server-only seed registry invokes them in sorted order.
- Do not use handwritten SQL for application queries or schema bootstrap. Create a named Drizzle migration. Operational `SELECT 1` healthchecks and inert reviewed `*.sql` test fixtures are not application query APIs.

## Connections and migrations

- `POSTGRES_URL` is the normal Bun SQL/Drizzle endpoint and defaults to PgBouncer in Compose.
- `POSTGRES_ADMIN_URL` connects directly to PostgreSQL for Drizzle Kit and migration/session-sensitive work.
- Runtime PostgreSQL uses Bun's `SQL`; PGlite is test-only.
- Run `bun run db:generate <name>`, review the artifact, then apply it with `bun run db:migrate` or `bun run db:prepare`.
- Commit both generated `migration.sql` and `snapshot.json` as a single reviewed migration. Never reformat either artifact.

## SQL fixtures

- A query-builder test keeps its expected SQL in a colocated `*.test.sql` file.
- Compare normalized values exactly:

  ```ts
  expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
  ```

- Fixtures are review artifacts, never executable bootstrap/query strings.

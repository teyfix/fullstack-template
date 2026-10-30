---
title: Solid template database contracts
summary: Locate application and Better Auth schema ownership, feature query placement, connection endpoints and migration commands.
description: Solid template PostgreSQL schema ownership, query placement, connections and generator commands.
---

# Database contracts

Read the shared [Drizzle skill](/../memory/.agents/skills/data/drizzle/SKILL.md) for lifecycle columns, active views, derived validators, helpers and SQL fixtures, and [PostgreSQL skill](/../memory/.agents/skills/data/postgresql/SKILL.md) for native values and query boundaries. [Runtime](/../memory/rules/runtime.md) owns the Bun SQL adapter; PGlite is test-only here.

## Application schema and queries

- Domain tables, enums, views and sequences use `appSchema`, created with `d.snakeCase.schema(ServerConfig.app.name)`. Shared columns are `identityColumns()` and `timestampColumns()`; active views live in feature-owned `*.views.ts`.
- Feature queries and named prepared statements live in `*.db.ts` and return closed `*Domain` values. Use the single application `db` instance, without passing it through feature function signatures or creating per-feature clients.
- Feature-owned `*.seed.ts` modules are deterministic and idempotent. The generated server-only seed registry invokes them in sorted order.
- Application queries and schema bootstrap use Drizzle. Operational healthchecks and inert reviewed SQL fixtures are separate boundaries under the shared skill.

## Better Auth integration

- Better Auth and plugins own `src/feat/auth/auth.generated.ts`; it is the provider-generated schema exception to domain lifecycle columns and active views. Never add application fields to it.
- After changing Better Auth configuration/plugins, run `bun run auth:generate`, then generate and review a named migration.
- Bootstrap administrators through Better Auth and the validated comma-separated `BETTER_AUTH_ADMIN_USER_IDS` allowlist. Never update provider-owned auth rows with ad hoc SQL.
- Auth and application data use separate PostgreSQL schemas: `better_auth` and the validated `APP_NAME` schema.

## Connections and migrations

- `POSTGRES_URL` is the normal Bun SQL/Drizzle endpoint and defaults to PgBouncer in Compose.
- `POSTGRES_ADMIN_URL` connects directly to PostgreSQL for Drizzle Kit and migration/session-sensitive work.
- Run `bun run db:generate <name>`, review the artifact, then apply it with `bun run db:migrate` or `bun run db:prepare`. The shared skill owns generated SQL/snapshot review and formatting boundaries.

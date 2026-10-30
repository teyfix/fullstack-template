---
title: Solid template database operations
summary: Locate schema/query ownership and preserve the template's shared-package pin, auth bootstrap and migration/toolchain operations.
---

# Database

The [project database contract](../.agents/rules/database.md) owns application/Better Auth schemas, feature query placement and connection endpoints. Shared [Drizzle schemas and queries](/../memory/.agents/skills/data/drizzle/references/schemas-and-queries.md), [migration and SQL-fixture guidance](/../memory/.agents/skills/data/drizzle/references/migrations-and-fixtures.md) and [PostgreSQL boundaries](/../memory/.agents/skills/data/postgresql/references/query-boundaries.md) own lifecycle columns, active views, derived validators, native values and wire conversion.

## Package boundary

The template consumes explicit `@teyfix/drizzle` subpaths such as `/pg` and `/render` from GitHub tag `v0.1.0`, without a sibling checkout dependency. Generic helper implementation belongs in [the package repository](https://github.com/teyfix/drizzle).

## Better Auth generation

After changing auth configuration/plugins:

```sh
bun run auth:generate
bun run db:generate better_auth_change
bun run db:check
```

`src/feat/auth/auth.generated.ts` remains CLI-owned. Application profile fields belong to their domain feature, referencing an opaque user ID; the provider-generated tables retain their scoped lifecycle/view exception in the project contract.

## Administrator bootstrap

Sign up through Better Auth's email endpoint/client, copy the returned user UUID into comma-separated `BETTER_AUTH_ADMIN_USER_IDS`, then restart the app. The admin plugin and server-function authorizer consume that validated list. After sign-in, use plugin-owned admin APIs for role management. An empty list accepts only persisted `admin` roles. Do not promote the first user with direct SQL.

## Migrations and feature deletion

```sh
bun run db:generate add_post_state
bun run db:prepare
```

The pinned Drizzle Kit CLI cannot combine `--config` with `--name`; `scripts/generate-migration.ts` uses its exported CLI SDK to preserve the repository config and explicit name. Shared migration guidance owns artifact review and generated-file preservation.

Deleting `src/feat/blog` removes its suffix-discovered tables/views from Drizzle Kit input. `bun run db:generate remove_blog` produces the separately reviewed removal migration; source generation does not apply it.

`drizzle/migrations.test.ts` applies committed migrations twice to in-memory PGlite. [Tooling](TOOLING.md#test-selection) owns its runner selection and the Bun/non-DOM environment distinction. PGlite remains test-only; application access uses Bun SQL.

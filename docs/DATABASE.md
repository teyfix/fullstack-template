# Database

## Contents

- [Package boundary](#package-boundary)
- [Schemas](#schemas)
- [Domain tables and views](#domain-tables-and-views)
- [Better Auth schema](#better-auth-schema)
- [Administrator bootstrap](#administrator-bootstrap)
- [Queries and JSON boundaries](#queries-and-json-boundaries)
- [Connections](#connections)
- [Migrations and deletion](#migrations-and-deletion)
- [SQL tests](#sql-tests)

## Package boundary

Generic Drizzle expressions, PostgreSQL column conventions, renderers, and Zod
wire codecs live in the [`@teyfix/drizzle`](https://github.com/teyfix/drizzle)
repository. This template consumes explicit subpaths such as
`@teyfix/drizzle/pg` and `@teyfix/drizzle/render`; it does not maintain another
copy or re-export native Drizzle APIs.

The dependency pins the versioned GitHub tag `v0.1.0` so installs are
reproducible and do not depend on a sibling checkout.

## Schemas

The application exposes two PostgreSQL schema boundaries:

```ts
import * as d from "drizzle-orm/pg-core";

export const appSchema = d.snakeCase.schema(ServerConfig.app.name);
export const authSchema = betterAuthSchema;
```

`appSchema` owns domain tables, views, enums, and sequences under the validated
`APP_NAME`. Better Auth owns the fixed `better_auth` schema. `import * as d` is
reserved for PostgreSQL primitives; helpers come from their owning packages.

## Domain tables and views

Every domain table has the same lifecycle:

```ts
export const post = appSchema.table("blog_post", {
  ...identityColumns(),
  title: d.text().notNull(),
  ...timestampColumns(),
});
```

That produces `id`, `created_at`, `updated_at`, and nullable `deleted_at`. A
matching `*.views.ts` owns the active-row predicate and omits the deletion
column:

```ts
const { deletedAt: _deletedAt, ...active } = getTableColumns(post);

export const activePost = appSchema
  .view("active_blog_post")
  .as((query) =>
    query.select(active).from(post).where(isNull(post.deletedAt)),
  );
```

Normal reads use the view so queries cannot forget a soft-delete check. Writes
use the table. `drizzle-orm/zod` infers both table and view boundary schemas; do
not add `drizzle-zod`.

## Better Auth schema

`src/feat/auth/auth.generated.ts` is CLI-owned. Better Auth plugins change its
shape, so domain lifecycle columns and active views do not apply to it. After an
auth configuration change:

```sh
bun run auth:generate
bun run db:generate better_auth_change
bun run db:check
```

Review the generated auth artifact and migration. Never hand-edit the generated
tables to add application profile fields; profiles belong to their domain
feature and reference an opaque user ID.

## Administrator bootstrap

Do not promote the first user with direct SQL. Sign up through Better Auth's
email endpoint/client, copy the returned user UUID into the comma-separated
`BETTER_AUTH_ADMIN_USER_IDS` environment value, and restart the app. Better
Auth's admin plugin and the server-function authorizer both consume that
validated list. Once signed in, use the plugin-owned admin APIs to manage roles;
an empty list means only persisted `admin` roles are accepted.

## Queries and JSON boundaries

Feature `*.db.ts` modules own named prepared Drizzle queries and return closed
`*Domain` values. Use the single `src/app/db/client.ts` instance; do not inject
`db` through every call or expose query builders through feature contracts.

PostgreSQL timestamps remain `Date` and big integers remain `bigint` inside
persistence. Convert them with explicit Zod codecs to ISO/decimal strings at a
server-function or JSON boundary. This avoids teaching database code about its
transport while keeping returned values serializable.

## Connections

- `POSTGRES_URL` is the application connection. Compose points it at PgBouncer and Bun's `SQL` backs Drizzle.
- `POSTGRES_ADMIN_URL` connects directly to PostgreSQL for migrations and session-sensitive administration.
- PGlite is allowed only in self-contained tests; production does not add `pg` or another PostgreSQL driver.

## Migrations and deletion

Application code never bootstraps schema or runs handwritten raw SQL. Generate
named Drizzle migrations and apply the committed artifacts before the server:

```sh
bun run db:generate add_post_state
bun run db:prepare
```

The pinned Drizzle Kit CLI cannot combine `--config` with `--name`, so
`db:generate` uses its exported CLI SDK to preserve both the repository config
and an explicit reviewable name. Commit the generated `migration.sql` and
`snapshot.json` together as one reviewed migration. Both remain byte-for-byte
Drizzle-owned and are excluded from Prettier.

`drizzle/migrations.test.ts` applies every committed migration twice to an
in-memory PGlite database. Vitest executes through Bun 1.4 and selects its
non-DOM `node` environment for this file; the environment name does not make
Node.js the runtime. Production database access remains Bun-native.

Deleting `src/feat/blog` removes its suffix-discovered tables/views from Drizzle
Kit input. `bun run db:generate remove_blog` turns that source change into an
explicit reviewable migration; it must not be silently applied as part of
source generation.

## SQL tests

Queries with a builder keep the expected output beside the test:

```text
post.db.ts
post.db.test.ts
post.db.test.sql
```

The assertion normalizes generated and expected formatting:

```ts
expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
```

The fixture is inert review data, not an executable query or migration.

# Teyfix Full-stack Template

A Bun-first Solid application template built with TanStack Start. The included
blog, profiles, authentication, and administration surfaces demonstrate
feature-owned routes, persistence, translations, and contributions. Removing a
feature folder and regenerating composition removes that feature from the app.

This repository is an application template, not a general utility package.
Project-agnostic Drizzle helpers have moved to the sibling
[`@teyfix/drizzle`](../drizzle/README.md) package.

## Contents

- [Stack](#stack)
- [Quick start](#quick-start)
- [Feature shape](#feature-shape)
- [Remove the blog](#remove-the-blog)
- [Commands](#commands)
- [Documentation](#documentation)
- [Current release constraints](#current-release-constraints)

## Stack

- Bun for the runtime, package manager, tests, and native PostgreSQL, Redis, and S3 clients.
- Solid 1 with TanStack Start, Router, and Form.
- TypeScript 7's native compiler for the repository type gates.
- Drizzle ORM with generated migrations and the separate `@teyfix/drizzle` additions.
- Better Auth with a CLI-generated Drizzle schema.
- Paraglide with feature-owned, two-document YAML and ICU MessageFormat.
- Tailwind CSS, Kobalte primitives, and local shadcn-style components.
- Nitro's Bun preset for the production server.

## Quick start

Create a real `.env` from `.env.example`, replace every example secret, then:

```sh
bun install
bun run generate
bun run dev
```

The development command regenerates feature composition before starting Vite,
then watches feature assets while the application runs.

For the first administrator, sign up through Better Auth, add the returned user
UUID to the comma-separated `BETTER_AUTH_ADMIN_USER_IDS` setting, and restart.
The same allowlist is used by Better Auth and the template's server-function
authorization; no generated auth table is edited.

## Feature shape

```text
src/
├── kernel/                 # stable, framework-neutral primitives
├── app/                    # composition, routes, adapters, UI, and infrastructure
└── feat/
    ├── auth/               # identity provider and generated auth schema
    ├── profiles/           # profile core and extension point
    └── blog/
        ├── posts/
        │   ├── admin/
        │   └── profile/    # blog-owned contribution to profile rendering
        └── comments/
            └── admin/
```

Features are not required to pretend they have no dependencies. They declare
acyclic dependencies, import only narrow public contracts, and own every
integration that should disappear with them. The application layer wires
providers and consumers; it does not hide feature coupling in a global service
locator.

## Remove the blog

1. Delete `src/feat/blog`.
2. Run `bun run features:sync` so routes, registries, and locale JSON lose blog contributions.
3. Run `bun run generate` to rebuild Paraglide and the typed route tree.
4. Run `bun run db:generate remove_blog` and review the generated destructive migration.
5. Run `bun run verify` and `bun run build`.

Source deletion does not delete production data by itself. The named, reviewed
migration is the explicit database-removal step.

## Commands

|Command|Purpose|
|-|-|
|`bun run dev`|Generate composition, watch features, and run the development server.|
|`bun run generate`|Synchronize features/messages, compile Paraglide, and generate routes.|
|`bun run features:sync`|Regenerate feature registries, virtual routes, and locale JSON.|
|`bun run test:unit`|Run Bun unit, generator, database-contract, and SQL fixture tests.|
|`bun run test:ui`|Run Solid DOM interaction and accessibility tests with Vitest.|
|`bun run test:migrations`|Apply committed migrations twice in an isolated PGlite database.|
|`bun run test`|Run the Bun, Solid DOM, and migration suites.|
|`bun run typecheck`|Regenerate artifacts and run strict TypeScript.|
|`bun run format`|Apply Biome and Prettier ownership.|
|`bun run format:check`|Check both formatters without changing files.|
|`bun run commitlint --edit <file>`|Validate a proposed Conventional Commit message.|
|`bun run verify`|Run formatting, tests, typechecking, migration checks, and Lefthook validation.|
|`bun run build`|Generate, typecheck, and build Nitro's Bun output.|
|`bun run start`|Run the built `.output/server/index.mjs` with Bun.|
|`bun run auth:generate`|Regenerate Better Auth's Drizzle schema.|
|`bun run db:check`|Validate the committed Drizzle migration journal.|
|`bun run db:generate <name>`|Generate a named Drizzle migration.|
|`bun run db:migrate`|Apply committed migrations through the admin connection.|
|`bun run db:prepare`|Migrate, then run deterministic discovered seeds.|

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — dependency direction, contracts, and composition.
- [`docs/FEATURES.md`](docs/FEATURES.md) — manifests, suffix discovery, generated artifacts, and deletion.
- [`docs/TANSTACK-START.md`](docs/TANSTACK-START.md) — routes, loaders, server functions, forms, and boundaries.
- [`docs/DATABASE.md`](docs/DATABASE.md) — application/auth schemas, lifecycle views, queries, and migrations.
- [`docs/I18N.md`](docs/I18N.md) — namespaced YAML, ICU examples, and Paraglide generation.
- [`docs/UI.md`](docs/UI.md) — Kobalte, local components, Tailwind, and image boundaries.
- [`docs/INFRASTRUCTURE.md`](docs/INFRASTRUCTURE.md) — configuration, Bun clients, and Compose.
- [`docs/ERRORS.md`](docs/ERRORS.md) — observable feature-owned errors.
- [`docs/TOOLING.md`](docs/TOOLING.md) — test split, formatter ownership, and hooks.
- [`docs/TEMPLATE.md`](docs/TEMPLATE.md) — extraction gate and pre-stable dependency risks.

## Current release constraints

TanStack Start is still documented as release-candidate software and the pinned
Nitro 3 line is beta. Keep exact versions and make the production build part of
every dependency update. `@teyfix/drizzle` is currently a local
`file:../drizzle` dependency because its GitHub repository/package has not yet
been published; consequently this checkout is not yet a standalone distributable
template. See [`docs/TEMPLATE.md`](docs/TEMPLATE.md).

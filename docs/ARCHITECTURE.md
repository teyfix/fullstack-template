# Architecture

## Contents

- [Goal](#goal)
- [Three source layers](#three-source-layers)
- [Dependency direction](#dependency-direction)
- [Ports and adapters](#ports-and-adapters)
- [Feature-owned integrations](#feature-owned-integrations)
- [Cross-feature data](#cross-feature-data)

## Goal

The template optimizes for deletion-safe vertical features, not the fiction
that every domain can be unaware of every other domain. A feature may depend on
another feature's stable public contract. That dependency is declared,
one-directional, and checked for cycles.

The stronger invariant is:

> The feature that should disappear owns every integration that should
> disappear with it.

## Three source layers

```text
src/kernel  <- shared stable primitives only
src/feat    <- removable business capabilities and their public contracts
src/app     <- framework shell, generated composition, and adapters
```

`kernel` knows no application framework or feature. A feature owns its domain,
DTOs, use cases, persistence, messages, routes, and extension contributions.
`app` is allowed to know several public contracts because its purpose is to
wire the concrete application.

Do not turn `app` into another business layer: it should select providers,
mount registries, and expose infrastructure, not own blog/auth/profile rules.

## Dependency direction

The manifest graph must be acyclic. Imports follow the same graph:

```text
auth ──implements──> identity provider contract
                           ^
                           │ wired by app
                           │
blog ───consumes────> author/identity port

profiles <──public extension contract── blog/posts/profile
```

Auth does not need to know which features use an identity. Blog can store an
opaque `UserId` without importing an auth table. Profiles does not import blog;
the blog feature owns and contributes the "recent posts" profile section.

If feature A directly imports a public contract from feature B, A declares B in
`dependencies`. An undeclared, missing, self, or cyclic dependency fails
feature generation.

## Ports and adapters

A consumer owns the capability-shaped port it needs:

```ts
export interface AuthorDirectory {
  findAuthors(
    ids: readonly UserId[],
  ): Promise<ReadonlyMap<UserId, AuthorDomain>>;
}
```

The application composition layer adapts the chosen identity provider to that
port. This keeps provider data structures, tables, and session implementation
out of the consumer. Keep ports narrow enough to express a use case; avoid a
generic repository or service-locator interface.

## Feature-owned integrations

Feature manifests declare extension-point contributions such as public/admin
routes, navigation, seeds, messages, an identity provider, or profile sections.
The generator emits separate registries for routes, navigation, profile
sections, seed loaders, and inert feature metadata. Public/admin shells consume
only the client-safe navigation registry. The application root injects the
profile registry through the profiles-owned extension context, and database
setup consumes the server-only seed registry. There is no broad client-visible
registry of DTO, database, seed, and message modules.

For example, `src/feat/blog/posts/profile` is blog code presented inside a
profiles extension point. Removing blog removes the section, its translations,
and its query. Placing that code under profiles would leave an invalid profile
integration after blog deletion.

## Cross-feature data

Prefer opaque IDs and application-level validation when maximum feature
isolation matters. A hard database foreign key is stronger integrity but also a
schema dependency; put it in the consumer or an explicit integration migration
and include it in the deletion review.

Queries that combine domains are explicit read models owned by the consuming
feature/integration. Never add an inverse domain dependency just so both
features can navigate each other's tables. Return closed `*Domain` objects so
Drizzle row shapes do not become accidental public APIs.

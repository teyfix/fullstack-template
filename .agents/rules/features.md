---
description: Deletion-safe feature ownership, dependencies, and contribution discovery.
---

# Features

## Contents

- [Feature contract](#feature-contract)
- [Dependency direction](#dependency-direction)
- [Contributions](#contributions)
- [Discovery](#discovery)
- [Deletion](#deletion)

## Feature contract

- Every `src/feat/<id>` has exactly one `<id>.feature.ts`; its descriptor ID matches the folder.
- Declare every direct feature dependency. Dependencies must exist and the graph must remain acyclic.
- Keep public contracts narrow. Place private implementation beside the use case; do not expose a feature's tables, auth internals, or framework components as its service API.
- Admin is a presentation/use-case branch inside its owner (`blog/posts/admin`), not an independent domain feature.

## Dependency direction

- A consumer owns the port it needs; the application composition layer supplies an adapter.
- Blog stores an opaque `UserId` and consumes an author/identity contract. Auth implements identity; auth never imports blog.
- Profiles owns profile data and a profile-section extension contract. Blog owns its posts/comments profile sections under `blog/**/profile`; profiles does not import blog.
- A feature may import another feature's public contract only when its manifest declares that dependency. Never import another feature's internal modules.
- Cross-feature joins are explicit consumer/integration read models. Do not introduce an inverse import merely to make a join convenient.

## Contributions

- The feature that should disappear owns the contribution that should disappear.
- Declare route, navigation, message, database, seed, identity-provider, and profile-section contributions in the feature manifest.
- Declare shell destinations as `navigation.public` and `navigation.admin`; their feature owns one root `<id>.navigation.tsx` module with the corresponding exported arrays.
- Declare `profile.sections` only when the feature owns at least one `*.profile-section.tsx` provider. The profiles feature owns the extension contract, not every provider.
- Generated registries are concern-specific. Client navigation/profile registries import only their UI contribution modules; the server-only seed registry imports only lazy seed loaders. Never import database/DTO/message loaders through a broad client-reachable registry.
- Shared shells consume generated registries. Do not add a central handwritten list of feature destinations or profile providers.

## Discovery

- Use the established suffixes: `*.dto.ts`, `*.schema.ts`, `*.tables.ts`, `*.views.ts`, `*.seed.ts`, `<id>.navigation.tsx`, and `*.profile-section.tsx`.
- Place messages at `<feature>/**/messages/<locale>/**/*.yaml`.
- A feature declaring `routes.public` owns `routes/public`; one declaring `routes.admin` owns `routes/admin`.
- Discovery uses deterministic `Bun.Glob` order. Add a generator test when extending its convention.

## Deletion

After deleting a feature folder:

1. Run `bun run features:sync` and confirm its routes, registries, and messages vanish.
2. Run `bun run generate` and confirm the typed route tree and Paraglide output compile.
3. Run `bun run db:generate remove_<feature>` and review every destructive statement.
4. Run `bun run verify` and `bun run build`.

Deletion safety means no forgotten source registration. It does not make data loss reversible or remove the need for a reviewed migration.

# Feature discovery and deletion

## Contents

- [Manifest](#manifest)
- [Discovered assets](#discovered-assets)
- [Routes](#routes)
- [Navigation and profile sections](#navigation-and-profile-sections)
- [Generated artifacts](#generated-artifacts)
- [Adding a feature](#adding-a-feature)
- [Deleting the blog](#deleting-the-blog)
- [What deletion guarantees](#what-deletion-guarantees)

## Manifest

Each `src/feat/<id>` has one root `<id>.feature.ts`:

```ts
export const feature = defineFeature({
  id: "blog",
  dependencies: ["auth", "profiles"],
  contributions: [
    "database",
    "messages",
    "navigation.admin",
    "navigation.public",
    "profile.sections",
    "routes.admin",
    "routes.public",
    "seeds",
  ],
});
```

IDs and path segments use lowercase kebab case. Dependencies must resolve and
remain acyclic. Detectable assets require their matching `database`, `messages`,
or `seeds` contribution, preventing a file from silently bypassing composition.

## Discovered assets

`Bun.Glob` scans feature folders deterministically:

|Suffix/path|Ownership|
|-|-|
|`<id>.feature.ts`|Feature identity, dependencies, and contributions.|
|`*.dto.ts`|Zod `*Query`, `*Model`, and `*Domain` boundary schemas.|
|`*.schema.ts`|Feature database schema composition.|
|`*.tables.ts`|Domain tables and enums.|
|`*.views.ts`|Active/read-model views.|
|`*.seed.ts`|Deterministic idempotent seeds.|
|`<id>.navigation.tsx`|Feature-owned public/admin navigation components.|
|`*.profile-section.tsx`|A provider for the profiles-owned extension contract.|
|`**/messages/<locale>/**/*.yaml`|Path-namespaced ICU copy.|

The conventions are intentionally suffix-based, so Drizzle Kit, seed loading,
message building, and feature deletion share the same physical ownership.

## Routes

A feature that declares `routes.public` owns `routes/public`. A feature that
declares `routes.admin` owns `routes/admin`. TanStack virtual routes merge those
physical directories into the public root and the application-owned `/admin`
shell:

```text
src/feat/blog/routes/public/   -> public blog routes
src/feat/blog/routes/admin/    -> /admin blog routes
```

The route tree remains typed and code-split by TanStack Router. Adding a new
feature does not require editing the application route registry.

## Navigation and profile sections

`navigation.public` and `navigation.admin` require one root
`<id>.navigation.tsx`. That module exports the declared `publicNavigation`
and/or `adminNavigation` arrays. The generated client registry imports only
these lightweight UI modules; it cannot expose tables, DTOs, seeds, or message
source files to the browser graph.

`profile.sections` requires at least one colocated `*.profile-section.tsx`
provider. Profiles owns `ProfileSection` and its context. Blog implements that
contract, while the application root injects the generated, ordered provider
set. Profiles never imports blog source.

## Generated artifacts

`bun run features:sync` atomically produces:

- `src/app/features.generated.ts` — inert feature descriptor metadata;
- `src/app/navigation.generated.ts` — client-safe public/admin navigation imports;
- `src/app/profile-sections.generated.ts` — client-safe profile-section imports;
- `src/app/routes.generated.ts` — TanStack virtual physical mounts;
- `src/app/seeds.generated.ts` — server-only lazy seed loaders;
- `messages/<locale>.json` — flattened, parity-checked ICU catalogs.

`bun run generate` additionally compiles `src/app/paraglide/**` and generates
`src/routeTree.gen.ts`. All outputs are ignored and generator-owned. A clean
checkout must be able to recreate them without handwritten recovery steps.

## Adding a feature

1. Create `src/feat/<id>/<id>.feature.ts` with explicit dependencies/contributions.
2. Add only the route directories and discovered assets the manifest declares.
3. Put public contracts at a deliberate boundary; keep feature implementation private.
4. Add two-document messages for every configured locale.
5. Run `bun run generate`, add focused tests, then run `bun run verify` and `bun run build`.

## Deleting the blog

```sh
# Delete src/feat/blog with the normal source-control operation.
bun run features:sync
bun run generate
bun run db:generate remove_blog
bun run verify
bun run build
```

Review the generated migration before applying it. It should remove blog-owned
tables/views/enums and any explicit integration constraints without changing
auth or profile storage. TypeScript and feature-graph checks identify remaining
consumers that were not truly optional.

## What deletion guarantees

Deletion removes source registration, routes, navigation contributions,
translations, seed loading, profile sections, and schema discovery. It does not:

- apply a destructive production migration automatically;
- make cross-feature data recoverable;
- prove that an external client no longer uses a removed URL;
- remove operational resources outside this repository.

Those are deployment decisions and remain explicit.

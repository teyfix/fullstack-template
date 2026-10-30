---
title: Solid template repository boundaries
summary: Own the template's source layout, generated artifacts and pinned compiler exception, with shared runtime guidance linked centrally.
description: Repository scope, dependency boundaries, and generated-source discipline.
---

# Repository

## Contents

- [Scope](#scope)
- [Source boundaries](#source-boundaries)
- [Generated files](#generated-files)
- [Change discipline](#change-discipline)

## Scope

- This repository is a Bun/TanStack Start/Solid application template, not a shared utility package.
- Project-agnostic Drizzle additions belong in the sibling `@teyfix/drizzle` repository. Do not recreate `src/drizzle`, `src/next`, or framework-neutral catch-all exports here.
- Repository type gates use the pinned TypeScript 7 native `tsc`; do not restore TypeScript 6 or its compatibility package.
- Keep dependency versions exact while TanStack Start, Nitro 3, and Better Auth remain on pre-stable lines.

## Source boundaries

- `src/kernel/**` contains stable, framework-neutral primitives such as branded IDs and the abstract application error.
- `src/feat/<feature>/**` owns one removable vertical slice: routes, use cases, DTOs, persistence, messages, and integrations that should vanish with it.
- `src/app/**` owns the composition root, framework shell, adapters, generated registries, shared UI, configuration, and infrastructure.
- Dependencies point toward stable contracts. The application may import multiple feature contracts to wire an adapter; a provider feature must not import its consumers.

## Generated files

Never hand-edit these outputs:

- `src/app/features.generated.ts`
- `src/app/navigation.generated.ts`
- `src/app/profile-sections.generated.ts`
- `src/app/routes.generated.ts`
- `src/app/seeds.generated.ts`
- `messages/*.json`
- `src/app/paraglide/**`
- `src/routeTree.gen.ts`
- `src/feat/auth/auth.generated.ts`
- generated Drizzle migration artifacts

Change their source inputs, run the owning generator, and review the resulting diff.

Generated output has two persistence classes. Commit Drizzle Kit migration SQL
and snapshots as reviewable database history, but never reformat either file.
Inside `project.inlang`, commit only `settings.json`; the directory-owned
`.gitignore` excludes generated caches, SDK metadata, and explanatory files.

## Change discipline

Follow the current [shared entrypoint](/../memory/AGENTS.md) and [Bun process selection](/../memory/.agents/skills/languages/typescript/references/bun.md). Shared workflow, dependency and server/browser configuration rules live centrally; this file owns the template's boundaries and explicit exceptions.

Deleting a feature is intentional only when the request names that feature and the removal migration is reviewed separately.

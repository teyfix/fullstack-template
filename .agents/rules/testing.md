---
description: Colocated test ownership, SQL fixtures, UI tests, and verification.
---

# Testing

## Contents

- [Colocation](#colocation)
- [Test split](#test-split)
- [Database fixtures](#database-fixtures)
- [Formatting and gates](#formatting-and-gates)

## Colocation

- Pair every behavior-owning source/tool module with a colocated test: `foo.ts` with `foo.test.ts`, and Solid UI with `foo.test.tsx`.
- Test generated-source renderers and discovery with temporary directories; do not assert only the checked-in generated result.
- Keep route files thin enough that loader/page/server-function behavior is testable in its owning feature module.

## Test split

- Bun owns `.test.ts` unit, schema, discovery, server, and SQL rendering tests.
- Vitest plus Solid Testing Library owns `.test.tsx` DOM interaction and accessibility tests.
- `drizzle/migrations.test.ts` is the one Node-environment Vitest exception: PGlite 0.5.5 exits Bun 1.3.14 with status 99 after a clean shutdown.
- Prefer roles, accessible names, state, and user interaction. If structural CSS matching is necessary, use a DOM selector/matcher rather than an exact `class="..."` serialization.
- Never expose secrets or internal exception messages in boundary snapshots/assertions.

## Database fixtures

- Query-builder tests compile real Drizzle queries and load a colocated checked-in `*.test.sql` fixture.
- Normalize both sides with `formatQuery`; whitespace-only formatting must not fail a query contract.
- Test committed migrations with PGlite when database behavior is required. Production runtime remains Bun SQL.

## Formatting and gates

- Biome formats/lints TS, JS, TSX, and JSX and sorts recognized Tailwind classes.
- Prettier formats SQL, shell, Markdown, JSON, and YAML.
- Generated `drizzle/*/{migration.sql,snapshot.json}` stays byte-for-byte generator-owned; Prettier owns authored SQL fixtures, not migration output.
- Prettier also excludes Inlang-generated cache, metadata, and README output; `project.inlang/settings.json` remains authored, formatted configuration.
- Commit messages follow Conventional Commits and are checked by commitlint in Lefthook's `commit-msg` hook. Keep `commitlint.config.ts` paired with its executable CLI test.
- Run focused checks while editing, then `bun run verify`. Framework, routing, config, dependency, or server changes also require `bun run build`.
- The pre-commit hook formats and lints staged source, then runs the complete test suite. Validate hooks with `bun run hooks:check`; install them with `bun x lefthook install` in a valid Git worktree.

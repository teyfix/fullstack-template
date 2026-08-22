# Tooling and verification

## Contents

- [Test split](#test-split)
- [SQL fixtures](#sql-fixtures)
- [Formatter ownership](#formatter-ownership)
- [Generation](#generation)
- [Lefthook](#lefthook)
- [Commit messages](#commit-messages)
- [Verification commands](#verification-commands)

## Test split

Every behavior-owning module has a colocated test:

```text
foo.ts      -> foo.test.ts   (Bun)
foo.tsx     -> foo.test.tsx  (Vitest + Solid Testing Library)
```

Bun tests cover Zod schemas, feature discovery, generated source rendering,
server/use-case logic, Drizzle compilation, config, and infrastructure
adapters. Vitest runs through Bun 1.4: its jsdom environment covers Solid
interaction and accessibility, while its non-DOM `node` environment isolates
the committed PGlite migration smoke test. The environment name does not select
Node.js as the runtime; Node.js is not part of the project toolchain.

When an authored script or test needs shell orchestration, use Bun's `$` tagged
template with interpolated arguments. Reserve `Bun.spawn` for direct lifecycle
management of non-shell child processes. Spread `process.env` into child shell
environments: Vite's ambient types add boolean client flags to `Bun.env`, which
is incompatible with the string-only process environment contract.

UI tests query by role/name and perform user-visible actions. They do not depend
on exact serialized HTML or Tailwind class order. Structural selectors are a
last resort when structure itself is the contract.

## SQL fixtures

A query-builder test loads a colocated checked-in `*.test.sql` file and compares
normalized text:

```ts
expect(formatQuery(generatedSQL)).toBe(formatQuery(expectedSQL));
```

This keeps SQL reviewable without making whitespace a contract. Fixtures are
never executed as application queries or schema bootstrap.

## Formatter ownership

- Biome formats/lints TypeScript, JavaScript, TSX, and JSX and sorts recognized Tailwind calls.
- Prettier formats SQL, shell, Markdown, JSON, and YAML.

Generated `drizzle/*/{migration.sql,snapshot.json}` is excluded so committed
migrations stay byte-for-byte Drizzle Kit output. Inlang-generated cache,
metadata, and README files are excluded too; its authored `settings.json`
remains formatted. Prettier still owns authored SQL fixtures.

Run `bun run format` to apply both or `bun run format:check` in CI. Do not run
both formatters over the same language.

## Generation

`bun run generate` is the single pre-build/pre-typecheck entry point:

1. `features:sync` discovers manifests/assets and writes concern-specific navigation, profile, seed, metadata, virtual-route, and JSON-catalog outputs;
2. `i18n:compile` compiles typed Paraglide modules;
3. `generate:routes` emits TanStack Router's typed tree.

Generator tests use temporary directories and verify stale-output removal.
Generated files are ignored and must be reproducible from source.

## Lefthook

Install repository hooks once:

```sh
bun x lefthook install
bun run hooks:check
```

Pre-commit formats and lints staged source, then runs the complete test suite.
Pre-push owns repository-wide formatting checks, tests, typechecking,
infrastructure validation, and migration-journal validation. Keep hook commands
expressed through package scripts so local and CI behavior stay aligned.

## Commit messages

Commit messages follow Conventional Commits through
`@commitlint/config-conventional`. Lefthook passes the proposed message file to
commitlint in the `commit-msg` hook:

```sh
bun run commitlint --edit .git/COMMIT_EDITMSG
```

The colocated `commitlint.config.test.ts` invokes the real CLI with one accepted
and one rejected message. This protects configuration discovery as well as the
rule behavior.

## Verification commands

```sh
bun run test:unit
bun run test:ui
bun run test:migrations
bun run test
bun run typecheck
bun run format:check
bun run commitlint --edit .git/COMMIT_EDITMSG
bun run verify
bun run build
```

`verify` covers formatting, tests, TypeScript, the migration journal, and hook
configuration. Run the production build as an additional gate after framework,
route, dependency, configuration, server, i18n, or generated-source changes.
The pinned `typescript` dependency is TypeScript 7, so both `typecheck` and
`build` invoke its native `tsc` rather than a TypeScript 6 compatibility binary.

# Template release strategy

## Contents

- [Template contract](#template-contract)
- [Current blockers](#current-blockers)
- [Pre-stable framework risk](#pre-stable-framework-risk)
- [Standalone release](#standalone-release)
- [Acceptance test](#acceptance-test)

## Template contract

The repository is both a working MVP blog/admin application and executable
guidance. A new project can retain blog as reference or delete
`src/feat/blog`, regenerate composition, and start with auth/profiles and the
application foundation.

A feature is removable when its folder owns every disappearing route, DTO,
message, table/view, seed, admin surface, navigation entry, and extension
contribution. The concern-specific generated registries are part of that contract; a handwritten
global import is a deletion leak.

## Current blockers

The template currently resolves `@teyfix/drizzle` as `file:../drizzle`, and
`Dockerfile.bun` receives that sibling as a named build context. The standalone
package/repository cannot be released until:

1. `github.com/teyfix/drizzle` is created and authenticated publication access is restored;
2. `@teyfix/drizzle` is published with its explicit subpath exports;
3. this package pins a registry version and regenerates `bun.lock`;
4. the transitional Docker named context is removed.

Do not describe the current checkout as standalone while it requires a sibling
directory.

## Pre-stable framework risk

The pinned stack intentionally favors efficient Solid development, with a few
known stability costs:

|Dependency|Current line|Policy|
|-|-|-|
|TanStack Start|`1.168.44`, documented as RC|Pin exactly; read matching official docs; run route/server/build tests on update.|
|Nitro|`3.0.260610-beta`|Pin exactly; verify Bun output and container startup on update.|
|Better Auth|`1.7.0-rc.6`|Regenerate auth schema and migration whenever config/plugins or version change.|
|Drizzle ORM/Kit|`1.0.0-rc.4`|Update together; rerun schema, SQL fixture, migration, and PGlite tests.|

Do not mix Solid 2 release-candidate packages into the Solid 1 application.
Avoid framework bridges that duplicate Start's router or server functions.

## Standalone release

Prefer this repository as the template source rather than a second hand-edited
copy. A release/exporter may ask for application name, locales, public domain,
and optional services, then:

1. write validated config and generate fresh secrets locally;
2. remove optional reference features before the initial migration;
3. regenerate messages, Paraglide, routes, Better Auth schema, and Drizzle migrations;
4. install from registry-only dependencies with a fresh lockfile;
5. run the complete acceptance gate in an isolated temporary directory.

A GitHub template repository is acceptable after the dependency blocker is
removed, but it cannot replace name/schema/secret regeneration when those
values are part of source artifacts.

## Acceptance test

The exported directory must have no access to this source checkout or a sibling
Drizzle repo. From that directory:

```sh
bun install --frozen-lockfile
bun run generate
bun run verify
bun run build
bun run db:check
docker compose config
```

Then start the built Bun server and its Compose services, verify the app health
endpoint, authentication flow, public blog, admin mutation, locale rewrite,
database migration/seed, and image URL resolution. Only then is the template
independently distributable.

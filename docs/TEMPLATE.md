# Template release strategy

## Contents

- [Template contract](#template-contract)
- [Published dependencies](#published-dependencies)
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

## Published dependencies

`@teyfix/drizzle` is published from `github.com/teyfix/drizzle` and pinned to
the versioned `v0.1.0` tag. The lockfile records that remote source, and the
container build requires only this repository as its build context. A sibling
Drizzle checkout is useful for package development but is no longer required to
install, verify, build, or export this template.

`@teyfix/paraglide-yaml` is installed from its versioned `v0.1.1` GitHub
release tarball. That artifact contains one minified Bun-targeted module and one
declaration file; the YAML/ICU compiler's implementation dependencies are
bundled into the module and do not become application dependencies. A sibling
compiler checkout is not required.

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
4. install from pinned remote dependencies with a fresh lockfile;
5. run the complete acceptance gate in an isolated temporary directory.

A GitHub template repository is now acceptable, but it cannot replace
name/schema/secret regeneration when those values are part of source artifacts.

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

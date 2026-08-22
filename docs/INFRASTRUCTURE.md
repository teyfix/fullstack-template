# Infrastructure and configuration

## Contents

- [Configuration exposure](#configuration-exposure)
- [PostgreSQL roles](#postgresql-roles)
- [Bun clients](#bun-clients)
- [Images and object storage](#images-and-object-storage)
- [Compose topology](#compose-topology)
- [Container build](#container-build)
- [Commands](#commands)

## Configuration exposure

Configuration is nested and validated at the boundary:

- `shared.config.ts` contains values safe in server and browser modules, currently the runtime environment;
- `client.config.ts` maps statically named `VITE_*` inputs to browser-safe config;
- `server.config.ts` maps private process environment into nested app, auth, image, PostgreSQL, Redis, and S3 config.

Each module exports its Zod schema, a parser used by tests, and the parsed
constant. No environment-backed application value gets a hidden default.
Browser-reachable modules must never import `server.config.ts`.

`.env` uses `APP_NAME` and `APP_SECRET` as its canonical Compose identity and
secret inputs; it may derive service-specific PostgreSQL/S3 values from them.
Runtime config still validates the resulting explicit service variables.

## PostgreSQL roles

- `POSTGRES_URL` is the normal application endpoint. Compose overrides it to `pgbouncer.lokal`, and Bun SQL backs the single Drizzle instance.
- `POSTGRES_ADMIN_URL` is the direct PostgreSQL endpoint for Drizzle Kit, migrations, and work that requires session semantics.

The one-shot migration service overrides both URLs to `postgres.lokal`, applies
committed migrations, runs deterministic seeds, then exits. The long-running
application receives the PgBouncer runtime URL.

## Bun clients

PostgreSQL, Redis, and S3-compatible transports use Bun's built-in `SQL`,
`RedisClient`, and `S3Client`. Each server-only module exports one
application-owned instance; JavaScript module caching handles its lifetime.

Runtime capabilities already provided by Bun, including cryptography and basic
image operations, must remain Bun-native. Do not add `pg`, `ioredis`, an AWS
SDK, or another third-party client. If Bun lacks a required capability, stop
and notify the operator instead of installing a fallback client. PGlite remains
an isolated test database, not a production client.

## Images and object storage

MinIO owns development object storage. `minio-init` creates the application and
public buckets idempotently. imgproxy joins the MinIO network and allows only
the configured `s3://<bucket>/` source.

The server image backend signs a URL from a validated bucket-relative key with
Bun's native cryptography. The Solid `Picture` component receives only the
resolved serializable image model.
Switching to ImageKit changes this backend binding, not blog/profile call sites.
Keep `IMGPROXY_KEY` and `IMGPROXY_SALT` server-only.

## Compose topology

`docker-compose.yaml` includes focused service files for the app, PostgreSQL and
PgBouncer, Redis, MinIO, and imgproxy. Each include declares its own internal
network. Only ingress services join the external `traefik_proxy` network;
container-to-container application traffic uses `.lokal` aliases.

The `.env` values are canonical externally reachable endpoints. Compose uses
`env_file` for the application and overrides only internal service endpoints.
Healthchecks use real service operations: `wget` for the app, `SELECT 1` for
PostgreSQL/PgBouncer, and native readiness commands for Redis, MinIO, and
imgproxy.

## Container build

`Dockerfile.bun` installs with the pinned Bun image, runs the normal production
build, and starts `.output/server/index.mjs` as the non-root Bun user. Private
environment is mounted as a BuildKit secret; only `VITE_APP_NAME` is a public
build argument. All dependencies resolve from the application context and
pinned remote sources; the build does not require sibling repository contexts.

## Commands

```sh
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs app
```

The external `traefik_proxy` network and a real `.env` must exist before
starting Compose. Never deploy `.env.example` unchanged.

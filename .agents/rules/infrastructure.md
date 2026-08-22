---
description: Configuration exposure, Bun clients, Docker, and service topology.
---

# Infrastructure

## Contents

- [Configuration](#configuration)
- [Clients](#clients)
- [Compose](#compose)
- [Secrets and healthchecks](#secrets-and-healthchecks)

## Configuration

- `.env` uses `APP_NAME` and `APP_SECRET` as the canonical Compose identity/secret inputs; service-specific values may derive from them in that file.
- `shared.config.ts` exposes only values safe in both environments; `client.config.ts` accepts statically named `VITE_*` variables; `server.config.ts` validates all private values.
- Each config exports a nested Zod schema, a testable parser, and the parsed constant. Do not read arbitrary environment keys from browser code or invent environment-backed defaults.
- Import `server.config.ts` only from server-only modules.

## Clients

- PostgreSQL, Redis, and S3 use Bun's built-in `SQL`, `RedisClient`, and `S3Client`.
- Use Bun-native runtime APIs for capabilities Bun already provides, including cryptography and basic image operations.
- Never install a third-party client to fill a Bun runtime capability gap. Stop and notify the operator when Bun does not provide a required capability.
- Application-owned module caching provides one client/DB instance; do not introduce a service locator.

## Compose

- Keep the canonical externally reachable endpoints in `.env`; Compose overrides service URLs with `.lokal` aliases for container traffic.
- Each service include declares its own internal network. Only ingress joins the external `traefik_proxy` network.
- PostgreSQL, PgBouncer, Redis, MinIO, imgproxy, migration, and app services remain independently healthchecked.
- `minio-init` creates required buckets idempotently. imgproxy reads only the allowed bucket and is exposed separately through Traefik.

## Secrets and healthchecks

- Never commit a usable `.env` or ship example credentials as production defaults.
- Build secrets use a mounted secret, not image layers or build arguments. Public `VITE_*` values are the only browser/build-time exception.
- App healthchecks use `wget`; PostgreSQL/PgBouncer healthchecks execute `SELECT 1`; service-specific clients check Redis, MinIO, and imgproxy readiness.

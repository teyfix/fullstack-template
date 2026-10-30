---
title: Solid template infrastructure
summary: Own the template's configuration names, native clients, service topology and concrete readiness checks while linking shared runtime and credential rules.
description: Configuration exposure, Bun clients, Docker, and service topology.
---

# Infrastructure

## Contents

- [Configuration](#configuration)
- [Clients](#clients)
- [Compose](#compose)
- [Secrets and healthchecks](#secrets-and-healthchecks)

## Configuration

Follow [shared environment and credentials](/../memory/rules/runtime.md#environment-configuration-and-development-credentials) and [typed application configuration](/../memory/.agents/skills/languages/typescript/references/application-configuration.md). Existing `.env.example` setup is implementation evidence, not an exception to the shared tracked development `.env` contract; migrate it only in scoped setup work.

- `APP_NAME` and `APP_SECRET` are the canonical Compose identity/secret inputs.
- `src/app/config/` owns the configuration modules. The browser-facing module is currently named `client.config.ts`, using statically named `VITE_*` inputs; retain that local filename until a scoped migration.
- Each config exports its nested Zod schema, testable parser and parsed constant.

## Clients

- PostgreSQL, Redis, and S3 use Bun's built-in `SQL`, `RedisClient`, and `S3Client`.
- Application-owned modules cache one client/DB instance; the shared [Bun boundary](/../memory/.agents/skills/languages/typescript/references/bun.md) owns process and native-API selection.

## Compose

- Compose overrides externally reachable service URLs with `.lokal` aliases for container traffic.
- Each service include declares its own internal network. Only ingress joins the external `traefik_proxy` network.
- PostgreSQL, PgBouncer, Redis, MinIO, imgproxy, migration, and app services remain independently healthchecked.
- `minio-init` creates required buckets idempotently. imgproxy reads only the allowed bucket and is exposed separately through Traefik.

## Secrets and healthchecks

- Production/provider credentials follow the shared credential boundary. Build secrets use mounted secrets, not image layers or build arguments; public `VITE_*` values are the browser/build-time exception.
- App healthchecks use `wget`; PostgreSQL/PgBouncer healthchecks execute `SELECT 1`; service-specific clients check Redis, MinIO, and imgproxy readiness.

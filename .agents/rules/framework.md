---
description: Solid-template routing layout and package-specific application contracts.
---

# Framework

Apply [Solid Start application boundaries](/../memory/.agents/skills/frameworks/tanstack-solid-start/references/application-boundaries.md).

- Use TanStack Start for Solid and TanStack Router; do not add another router.
- Shell routes live in `src/app/routes`; removable feature routes live in `routes/public` or `routes/admin` and enter generated virtual routes.
- Browser-imported RPC declarations use `*.functions.ts`; implementations use `*.server.ts`/`*.db.ts`. The pinned Start API uses `createServerFn({ method })`, `.validator(...)` and a narrow handler.
- Feature persistence operations live in `*.db.ts`. Zod contracts are named `*Model` for payloads, `*Query` for URL input and `*Domain` for returned data.
- Search uses the shared `qs` codec: dots for nested objects and commas for arrays. Do not alias public keys.
- Forms use TanStack Solid Form with the server function's Zod model.
- One route renders one named `*.page.tsx`. Global pending, not-found and error components provide the fallback for routes without a specific presentation.

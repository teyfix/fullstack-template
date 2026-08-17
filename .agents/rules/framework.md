---
description: TanStack Start, Solid Router, server-function, and form conventions.
---

# Framework

## Contents

- [Routes](#routes)
- [Reads and mutations](#reads-and-mutations)
- [Search state](#search-state)
- [Forms](#forms)
- [Pending and failure states](#pending-and-failure-states)

## Routes

- Use TanStack Start for Solid and TanStack Router. Do not add `@solidjs/start`, Next.js conventions, or a second router.
- Application shell routes live in `src/app/routes`; removable routes live in their feature's `routes/public` or `routes/admin` directory and are mounted through generated virtual routes.
- Keep the root route focused on the HTML document and router outlet. Application-wide providers belong in a named `src/app` composition component, not inline inside route markup.
- A route file validates URL input, invokes a loader/server function, and renders one named feature page component. It does not own reusable presentation or query implementation.
- Keep mapped rows and complex conditional branches in named components. Do not grow complex inline renders inside iteration callbacks.
- Prefer SSR and server functions. Add a raw server route only for an external protocol, webhook, or handler that cannot use the application's typed server-function boundary.

## Reads and mutations

- Use `createServerFn({ method })`, a Zod `.validator(...)`, and a narrow handler for both reads and writes.
- Define browser-imported RPC declarations in `*.functions.ts`. Keep database, auth, config, and other implementation-only dependencies in `*.server.ts`/`*.db.ts`; TanStack rejects direct client-graph imports of those server-only filenames.
- Statically import server-only database/auth modules from server functions. TanStack Start replaces the server implementation with an RPC stub in browser graphs; do not hide these dependencies behind dynamic imports.
- Authorize at every protected server function before executing its use case. Client guards are presentation only.
- Server functions call feature-owned `*.db.ts` operations directly; never fetch the application's own HTTP route during SSR.
- Zod is the shared client/server validation authority. A payload is a `*Model`, URL input is a `*Query`, and returned application data is a `*Domain`.

## Search state

- Router search parsing uses the shared `qs` codec: dots represent nested objects and commas represent arrays.
- Validate route search with a feature Zod `*Query` schema. Client navigation only updates URL state; server loaders own parsing, validation, and reads.
- Do not hide public keys behind a misleading key-alias abstraction.

## Forms

- Use TanStack Solid Form with the same Zod `*Model` passed to the server function.
- Render field labels, descriptions, errors, disabled state, and submission progress through local accessible components.
- Keep submission logic in the form/page boundary and persistence in the server function/use case.

## Pending and failure states

- Data routes provide an intentional `pendingComponent`; the router's default pending UI is only the global floor.
- Use a route `notFoundComponent` with `throw notFound()` for expected absence.
- Use route `errorComponent` for recoverable route failures and expose retry/reset without rendering internal error messages.
- Keep global pending, not-found, and error components in the application router for routes without a more specific presentation.

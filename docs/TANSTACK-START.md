# TanStack Start and Solid

## Contents

- [Framework boundary](#framework-boundary)
- [Route files](#route-files)
- [Server functions](#server-functions)
- [Search parameters](#search-parameters)
- [Forms](#forms)
- [Pending, not-found, and error UI](#pending-not-found-and-error-ui)
- [Raw server routes](#raw-server-routes)

## Framework boundary

The template uses TanStack Start for Solid as one coherent SSR, router, and
server-function stack. Nitro produces the Bun server. It does not combine
SolidStart with a separate router bridge, and it does not carry over Next.js
file conventions.

Application shell routes live in `src/app/routes`; feature routes are physical
directories mounted by `src/app/routes.generated.ts`. `src/router.tsx` owns
global search serialization, locale URL rewriting, preloading, scroll
restoration, and default boundaries.

Keep the root route focused on document markup and the router outlet. Compose
application-wide context/providers in a named `src/app` component so the root
route does not accumulate authentication, theme, query, or notification setup.

## Route files

A route validates URL state, loads serializable data, and renders a named page:

```tsx
export const Route = createFileRoute("/blog/")({
  validateSearch: PostListQuerySchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => fetchPublishedPosts({ data: deps }),
  pendingComponent: PostListSkeleton,
  errorComponent: PostListError,
  component: PostListRoute,
});

function PostListRoute() {
  return <PostListPage domain={Route.useLoaderData()} />;
}
```

Keep route adapters small. Page composition belongs in a feature-owned
`*.page.tsx`; list rows/cards, skeletons, empty states, and complex branches are
named components rather than inline iteration bodies.

## Server functions

Use one Zod validator at the network boundary:

```ts
export const fetchPublishedPosts = createServerFn({ method: "GET" })
  .validator(PostListQuerySchema)
  .handler(async ({ data }) => {
    return fetchPublishedPostListDomain(data);
  });
```

Keep the exported RPC declaration in a `*.functions.ts` module so route and
form code can import its transformed client stub. Its handler may statically
import `*.server.ts` and `*.db.ts` implementation modules; never import those
server-only filenames directly from a browser-reachable route/component.

For a mutation, use `POST`, validate the `*Model`, authorize before the use
case, and return a serializable `*Domain`. Database, auth, config, and Bun client
imports stay server-only. Import them statically: TanStack Start transforms the
server function into a client-side RPC stub and explicitly discourages dynamic
imports inside its handler. A loader calls the server function directly; SSR
must not perform an HTTP request back into its own application.

## Search parameters

The router's application codec uses `qs` with a stable grammar:

```text
filter.author.id=…&filter.tags=solid,bun
```

Dots create object structure and commas create arrays. The route's Zod
`*Query` is the authority after decoding. Navigation updates URL state and lets
the loader refetch; client search state never becomes the server serializer or
validation layer.

## Forms

TanStack Solid Form and the server function share one Zod `*Model`:

```tsx
const form = createForm(() => ({
  defaultValues: { title: "", slug: "" },
  validators: { onChange: CreatePostModelSchema },
  onSubmit: ({ value }) => createPost({
    data: CreatePostModelSchema.parse(value),
  }),
}));
```

Use local accessible field components for labels, descriptions, errors, and
submission state. Keep database writes out of the form component and keep
server authorization independent of the client-visible disabled state.

## Pending, not-found, and error UI

TanStack Router uses component options, not `loading.tsx`, `not-found.tsx`, or
`error.tsx` filenames:

- `pendingComponent` renders an accessible local skeleton while a loader waits;
- `throw notFound()` selects the route's `notFoundComponent` for expected absence;
- `errorComponent` handles unexpected route failures and exposes retry/reset;
- router defaults provide a safe global floor.

Data routes should define a feature-appropriate pending component. A failure UI
may show an opaque correlation identifier, but never the exception message,
stack, SQL, environment values, or authentication internals.

## Raw server routes

Prefer SSR loaders and server functions. A raw server route is appropriate only
for a genuinely external HTTP contract such as a webhook, a machine client, or
Better Auth's handler. Such a route owns explicit request/response Zod schemas,
authentication, status mapping, and tests; it is not an internal data-fetching
shortcut.

Primary references: [TanStack Start for Solid](https://tanstack.com/start/latest/docs/framework/solid/overview),
[server functions](https://tanstack.com/start/latest/docs/framework/solid/guide/server-functions),
and [virtual file routes](https://tanstack.com/router/latest/docs/routing/virtual-file-routes).

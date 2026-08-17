# Application errors

## Contents

- [Observable identity](#observable-identity)
- [Feature ownership](#feature-ownership)
- [Server boundaries](#server-boundaries)
- [Rendering failures](#rendering-failures)

## Observable identity

An application failure has a stable, low-cardinality identity:

```text
[feature, scope, code]
```

`feature` is the owning vertical slice, `scope` is the operation/boundary, and
`code` is a reusable reason such as `not_found`, `invalid`, `unauthenticated`,
`forbidden`, or `failed`. Keep codes generic: use
`{ feature: "blog", scope: "post", code: "not_found" }`, not
`BLOG_POST_NOT_FOUND`.

The tuple is suitable for logs, metrics, and traces. User-facing message and
class name are not grouping dimensions.

## Feature ownership

`src/kernel/errors/application-error.ts` is abstract. Concrete errors remain in
their feature:

```ts
export class UnauthenticatedError extends AuthError<
  "session",
  "unauthenticated"
> {
  readonly status = 401;
}
```

Feature-local bases may fix the feature name, but another feature must not
inherit auth/blog-specific errors. Preserve the original error as `cause` for
server observability; `toJSON()` returns only the safe tuple, name, and message.

## Server boundaries

Server functions validate input with Zod before running a use case and map
expected application errors deliberately. Authentication absence is 401,
authenticated denial is 403, expected missing data is 404, invalid input is
422, and an unexpected infrastructure/programming failure stays a private 500.

Do not serialize `cause`, stack, SQL, database details, tokens, or environment.
Raw external HTTP routes use the same convention and distinguish malformed
request data from a server response-contract failure.

## Rendering failures

Expected route absence uses `throw notFound()` and a feature-appropriate
`notFoundComponent`. Unexpected route errors reach an `errorComponent` that
offers retry/reset. It may render an opaque digest/correlation reference but
never the exception message. The global router boundary supplies the same safe
floor for routes without a narrower component.

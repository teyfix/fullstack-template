# UI conventions

## Contents

- [Component hierarchy](#component-hierarchy)
- [No duplicate primitives](#no-duplicate-primitives)
- [Page composition](#page-composition)
- [Tailwind and theme](#tailwind-and-theme)
- [Forms](#forms)
- [Images](#images)
- [Testing](#testing)

## Component hierarchy

Kobalte supplies accessible, unstyled Solid primitives analogous to Radix UI.
Application-owned components in `src/app/ui` combine those behaviors with
Tailwind/CVA variants in a shadcn-style source-owned model. Feature components
import the local surface rather than styling Kobalte independently in every
feature.

React-only shadcn/Radix packages, `react-hook-form`, and
`@tw-classed/react` do not belong in the Solid template. TanStack Solid Form and
the local `cn`/CVA helpers serve those roles.

## No duplicate primitives

Before implementing UI:

1. Search `src/app/ui` for an existing concept.
2. Search Kobalte for the accessible behavior.
3. Check a maintained Solid component source/recipe.
4. Add a local primitive only when the concept is still missing.

Feature pages should not use a bare semantic element when a local component
already exists. A truly feature-specific semantic wrapper may be a named
top-level component in that feature; it should not become a generic primitive
without reuse evidence.

## Page composition

Each route renders one feature `*.page.tsx`. Pages compose named cards, rows,
forms, empty states, and skeletons. Move complex mapped or conditional markup to
a component:

```tsx
<For each={props.posts}>
  {(post) => <PostSummaryCard post={post} />}
</For>
```

This keeps list-item behavior testable and prevents a short page from becoming
hundreds of lines after a few feature iterations.

## Tailwind and theme

- `src/theme/globals.css` owns global tokens and Tailwind imports.
- `src/theme/fonts.ts` exports font declarations.
- `cn` combines conditional classes; CVA owns documented variants.
- Biome recognizes `cn`, `cva`, `clsx`, and `twMerge` calls for Tailwind sorting.
- TypeScript/JSX stays under Biome; Prettier owns the non-code formats listed in the tooling guide.

## Forms

Use Kobalte-backed/local field components with TanStack Solid Form. A field
renders a programmatic label, optional description, validation message, and
disabled/pending state. One feature Zod `*Model` validates both the form and the
server function; server authorization remains mandatory regardless of client
validation.

## Images

`Picture` is the presentation abstraction. A server-only `ImageBackend` turns a
validated bucket-relative key into a signed imgproxy URL (or a later ImageKit
URL), then passes a serializable `{ src, width, height, alt }` model to the
component. Feature code neither signs URLs nor imports provider secrets.

Returning stable asset keys from domain APIs keeps the backend pluggable.
Returning a resolved URL from the server presentation boundary keeps signing
authority off the client.

## Testing

Use Solid Testing Library and query by role/name. Assert behavior, validation,
focus, disabled state, and visible feedback. Avoid exact HTML/class-string
snapshots; a class-order change is not a behavioral regression. Use a DOM CSS
selector only when structure itself is the contract.

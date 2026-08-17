---
description: Solid UI primitives, accessibility, Tailwind, and image boundaries.
---

# UI

## Contents

- [Component sources](#component-sources)
- [Markup and composition](#markup-and-composition)
- [Styles and theme](#styles-and-theme)
- [Images](#images)

## Component sources

- Search the repository and Kobalte before inventing a component. Prefer a maintained accessible Kobalte primitive when one exists.
- Feature code imports local components from `src/app/ui`; Kobalte is the Radix-equivalent behavior layer and local shadcn-style sources own the application's markup and tokens.
- Do not add React-only shadcn, Radix React, `react-hook-form`, or `@tw-classed/react` packages to the Solid template.

## Markup and composition

- Feature pages do not emit a bare semantic element when a local component already owns that concept.
- A genuinely unique semantic wrapper is a named top-level component in its file; do not bury substantial markup inside a loop or conditional callback.
- Preserve native semantics and accessible names. Test behavior and roles instead of exact serialized HTML or class ordering.
- One route renders one named `*.page.tsx` component; reusable cards, rows, skeletons, and empty states remain separate components.

## Styles and theme

- Use Tailwind through local components, `cn`, and CVA variants. Biome sorts recognized Tailwind strings in `cn`, `cva`, `clsx`, and `twMerge` calls.
- Global tokens and Tailwind imports live in `src/theme/globals.css`; exported font definitions live in `src/theme/fonts.ts`.
- Biome owns TypeScript/JSX formatting and linting. Do not add an unconfigured styling factory to bypass its class sorting.

## Images

- Feature/domain values expose stable asset keys or a resolved serializable image model, not imgproxy secrets.
- Server-only backends sign/resolve provider URLs; the local `Picture` component renders the resulting URL without knowing whether the provider is imgproxy, ImageKit, or another backend.
- Keep image dimensions and useful alternative text explicit. Provider migration should change the adapter, not every feature call site.

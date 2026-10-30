---
description: Solid-template component packages, theme files and image rendering.
---

# UI

Apply [Solid UI boundaries](/../memory/.agents/skills/frameworks/tanstack-solid-start/references/ui-boundaries.md).

- Use Kobalte through local `src/app/ui` components; local shadcn-style sources own markup and tokens. Feature pages reuse the local component for an existing concept.
- Use Tailwind, `cn` and CVA variants. Biome sorts recognized classes in `cn`, `cva`, `clsx` and `twMerge`; do not add an unconfigured styling factory.
- Global tokens and imports live in `src/theme/globals.css`; exported font definitions live in `src/theme/fonts.ts`.
- The local `Picture` component consumes server-resolved image URLs; provider signing stays server-side.

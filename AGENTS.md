---
title: Agent Rule Map
description: Progressive read-map for the Solid full-stack template.
---

# Agent Rule Map

## Contents

- [Always read](#always-read)
- [Read by task](#read-by-task)
- [Source order](#source-order)

## Always read

- `.agents/rules/repository.md` — scope, boundaries, generated files, and change discipline.
- `.agents/rules/testing.md` — colocated tests and verification gates.

## Read by task

- `.agents/rules/features.md` before changing `src/feat/**` or feature discovery.
- `.agents/rules/framework.md` before changing routes, server functions, forms, or `src/router.tsx`.
- `.agents/rules/database.md` before changing Drizzle, Better Auth schema, migrations, or seeds.
- `.agents/rules/i18n.md` before changing messages, locale routing, or message generation.
- `.agents/rules/ui.md` before changing UI components, styles, fonts, or images.
- `.agents/rules/infrastructure.md` before changing configuration, Bun clients, Docker, or Compose.

## Source order

The current user request outranks repository guidance. After that, prefer the
pinned tools' official documentation, executable tests, agent rules, then
user-facing docs. Do not hand-edit generated files to make a check pass.

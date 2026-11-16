---
name: content-sdk-component-registration
description: Makes a Sitecore component resolvable by layout and editing. The component maps (.sitecore/component-map.ts and component-map.client.ts) are generated from src/components by sitecore-tools; never edit them by hand. Use when adding a component or when layout/editor cannot find one.
---

# Content SDK Component Registration (App Router)

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, ask first. Shared reference docs live in `.skills/sitecore-reference/references/`.

Make components resolvable by the layout and editing pipeline. The two component maps (server and client) are **generated**; registering a
component means putting its file in the right place with the right name and regenerating. The full rule is `sitecore-rules.md` → Component map.

## When to Use

- After scaffolding or adding a new Sitecore component.
- User reports a component not rendering, "component not found," or a placeholder showing the raw component name.
- Task involves `.sitecore/component-map.ts` or `.sitecore/component-map.client.ts`.
- User asks how to register a component or fix component resolution.

## How to perform

1. The component file lives under `src/components/<area>/` and its file name equals the Sitecore rendering's component name (PascalCase).
2. Server or client is set by the file itself: `'use client'` as the first line makes it a client component (it then also lands in the client map).
3. Run `npm run sitecore-tools:generate-map` in the customer app (or let the `npm run dev` watcher do it) and check the key is now in the map.

## Hard Rules

- **Never edit `.sitecore/component-map*.ts` or `import-map*.ts` by hand**: they are regenerated and the edit is lost.
- Map key = file name = the rendering's component name. To rename a component, rename the file and the rendering's component name together.
- `src/components/content-sdk/*` is excluded from the maps by `sitecore.cli.config.ts`; do not put Sitecore-rendered components there.

## Stop Conditions

- Stop if it is unclear whether the component must be client or server and the app convention does not settle it; ask.
- Do not edit `.sitecore/metadata.json` unless the task explicitly requires it.

## References

- [AGENTS.md](../../../AGENTS.md) for component maps and editing routes.
- [Official Content SDK docs](https://doc.sitecore.com/sai/en/developers/content-sdk/sitecore-content-sdk-for-sitecoreai.html).

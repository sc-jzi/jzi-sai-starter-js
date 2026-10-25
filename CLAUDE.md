# Demo harness: build prospect demo sites on Sitecore XM Cloud

This repository builds a skinned copy of a prospect's website as a Sitecore XM Cloud demo (new site, pages, components, theme, personalization,
a local Next.js app), driven from Cursor or Claude Code. Start with `README-DEMO-HARNESS.md` (the SE's guide).

## Entry points
- **`/new-demo <prospect, website, what you know>`**: the whole flow, story → plan → build → hand-over.
- **`/resume-demo <customer>`**: continue a run that stopped (Marketer MCP not connected, a cut turn, an unanswered gate).
- All other skills: `.skills/<name>/SKILL.md`. That is the only copy; `.cursor/skills` and `.claude/skills` hold generated stubs that point to it.

## Rules
**`.skills/RULES.md` (R1–R24) is the one source for how a demo is built.** Read it before any demo work; when anything else disagrees, it wins.
The ones that matter in every session, demo run or not:
- **R5 Marketer MCP first** for every Sitecore write it supports, with a read-back. Scripts write directly only for what the MCP cannot do
  (site creation, media upload, variants / rendering parameters when the MCP route is refused, the editing host). Reading to verify is always fine.
- **R16 Code only in `industry-verticals/<customer>/`.** `industry-verticals/prospera` is the base app (read-only). Other customers' folders are
  invisible: never open, list or search them.
- **R17 The app always builds:** `node harness/scripts/build-check.mjs <customer>` after a code change; fix what it prints before saying you are done.
  The pre-commit hook refuses a commit that breaks a build; never bypass it (`--no-verify`).
- **R18 No prospect names in the shared harness** (`harness/`, `.skills/`, `.cursor/`, `.claude/`, this file). One-off scripts for a demo go in
  `industry-verticals/<customer>/docs/ai/demos/<customer>/tmp/` and import `../../../../../../../harness/scripts/_lib.mjs`.
- **R19 Edit skills only in `.skills/`,** then `node harness/scripts/sync-skills.mjs`.
- **R20 Never invent facts; never paste secrets** (they live in `harness/.env.local`).
- **R11 Localhost reads master** (preview context): no publish needed while building.

## Repository map
| Path | What |
|---|---|
| `industry-verticals/prospera/` | the base app every demo is copied from (read-only) |
| `industry-verticals/<customer>/` | one demo: its Next.js app, and `docs/ai/demos/<customer>/` (plan, measurements, captures, progress; git-ignored) |
| `harness/scripts/` | the harness tools (below); `_lib.mjs` and `_yaml.mjs` are the shared helpers |
| `harness/reference/` | API notes, `marketer-mcp-tools.md` (what the MCP can do + "Verified methods") |
| `harness/templates/` | plan, brief and progress templates |
| `harness/inbox/` | where the SE drops transcripts / RFPs (git-ignored) |
| `.skills/` | skills (`RULES.md`, `new-demo`, `demo-*`, `sitecore-*`, `content-sdk-*`) |
| `.githooks/pre-commit` | refuses prospect names in the harness, stale skill stubs, broken builds (enabled by `deps-check.mjs --fix`) |
| `examples/` | upstream Sitecore starter kits; not used by the demo flow (contribution policy: `CONTRIBUTING.md`) |

## Harness commands (run from the repo root)
| Command | Purpose |
|---|---|
| `node harness/scripts/env-check.mjs` | settings in `harness/.env.local` present |
| `node harness/scripts/deps-check.mjs --fix` | Node, git, Playwright, readers, the pre-commit hook |
| `node harness/scripts/run-gate.mjs check <customer>` | **the** definition of done (exit 0); `--fast` is what the stop hook runs |
| `node harness/scripts/run-gate.mjs approve <customer> story\|plan` | record an SE approval (only right after the SE said yes) |
| `node harness/scripts/run-gate.mjs block <customer> "<what>" -- <command>` | log a failed attempt (two are needed for a BLOCKED line) |
| `node harness/scripts/looks-gates.mjs <customer>` | compare the running app with the prospect's pages (header + every mirrored page) |
| `node harness/scripts/looks-review.mjs <customer> --open` · `run-gate.mjs accept <customer> all|none|<n>` | after two fix attempts: the SE's side-by-side page, ONE question, record the answer |
| `node harness/scripts/build-check.mjs <customer> [--quick]` | `npm run build` (or a typecheck) of the customer app |
| `node harness/scripts/link-audit.mjs <customer>` | every link / image field in the site holds valid XML |
| `node harness/scripts/collect-images.mjs <customer>` | every image of every planned section, traced to its page and section (the only way images enter a demo) |
| `node harness/scripts/attach-images.mjs <customer>` | proposes which uploaded image goes into which Image field (write them with the MCP) |
| `node harness/scripts/media-upload.mjs <customer>` | upload images to the Media Library when `CH_ENABLED=false` (skips files over 50 MB) |
| `node harness/scripts/name-check.mjs` · `sync-skills.mjs` | R18 (nothing prospect-specific in the harness) · R19 |

## The customer app (Next.js 16, App Router, Content SDK 2.x)
- Routing: `src/app/[site]/[locale]/[[...path]]/page.tsx`; the request pipeline is `src/proxy.ts` (Content SDK proxies). i18n: `next-intl`.
- Imports: components use `@sitecore-content-sdk/nextjs` (`Text`, `RichText`, `Image`, `Link`, `useSitecore`, field types). Never import
  `/config`, `/config-cli`, `/tools` or `/client` in a component.
- A component is ONE file, `src/components/<area>/<Name>.tsx`, holding its props types and its named variant exports (`Default` plus the demo's
  client variant). Server components get the page from their `page` prop; `useSitecore()` only in files that start with `'use client'`.
- Guard every field: `fields?.data?.datasource`, optional chaining, render a field only when it exists (or when editing).
- Styling: SCSS in `src/assets/sass/` with the `site-<customer>` theme block (`_colors.scss`, `src/lib/site-theme.ts`).
- `.sitecore/component-map*.ts` and `import-map*.ts` are generated by `npm run sitecore-tools:generate-map` (and by `npm run dev` / `build`):
  regenerate, never hand-edit.

## Never edit
`node_modules/`, `.next/`, build output, lock files, `.env.local` / `harness/.env.local` (secrets), `industry-verticals/prospera/` during a demo,
another customer's folder, `.cursor/skills` / `.claude/skills` stubs (edit `.skills/` and sync), measurement JSON (`nav.json`, `header-styles*.json`,
`sections*.json`: re-measure with the scripts, R14), `approvals.json` / `blocked-log.jsonl` / verdict files (written by the scripts).

## Git
Commit only when the SE asks. The pre-commit hook runs the name check, the skill-stub check and the build of every app with staged code; a refused
commit is fixed, never bypassed.

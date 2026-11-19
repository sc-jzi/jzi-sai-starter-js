# Demo harness: build prospect demo sites on Sitecore XM Cloud

This repository builds a skinned copy of a prospect's website as a Sitecore XM Cloud demo (new site, pages, components, theme, personalization,
a local Next.js app), driven from Cursor or Claude Code. Start with `README-DEMO-HARNESS.md` (the SE's guide).

## Entry points
- **`/new-demo <prospect, website, what you know>`**: the whole flow, story → plan → build → hand-over.
- **`/resume-demo <customer>`**: continue a run that stopped (Marketer MCP not connected, a cut turn, an unanswered gate).
- All other skills: `.skills/<name>/SKILL.md`. That is the only copy; `.cursor/skills` and `.claude/skills` hold generated stubs that point to it.

## Rules
**`.skills/RULES.md` (R1–R27) is the one source for how a demo is built**, and it applies in every session, demo run or not. It is loaded
here in full, never summarised (a summary drifts): when anything else disagrees, it wins.

@.skills/RULES.md

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
| `node harness/scripts/deps-check.mjs --fix` | Node, git, Playwright, readers, the pre-commit hook || `node harness/scripts/shared-layer-check.mjs` | the environment has the base app's shared renderings and templates (T0; `create-site --apply` refuses without) |
| `node harness/scripts/ch-render-check.mjs <customer>` | Content Hub images reach the app (not empty); the bulk Content Hub upload and the gate need it |
| `node harness/scripts/run-gate.mjs check <customer>` | **the** definition of done (exit 0); `--fast` is what the stop hook runs |
| `node harness/scripts/run-gate.mjs approve <customer> story\|plan` | record an SE approval (only right after the SE said yes) |
| `node harness/scripts/run-gate.mjs swap <customer> "<page>#<section>" --reason "<why>"` | a section now uses a better-fitting component than the approved plan (no SE question; hand-over lists it) |
| `node harness/scripts/run-gate.mjs block <customer> "<what>" -- <command>` | log a failed attempt (two are needed for a BLOCKED line) |
| `node harness/scripts/looks-gates.mjs <customer>` | compare the running app with the prospect's pages (header + every mirrored page) |
| `node harness/scripts/looks-review.mjs <customer> --open` · `run-gate.mjs accept <customer> all|none|<n>` | after two fix attempts: ONE side-by-side page for all pages (visible differences only), ONE question, record the answer |
| `node harness/scripts/build-check.mjs <customer> [--quick]` | `npm run build` (or a typecheck) of the customer app |
| `node harness/scripts/layout-variant.mjs apply --plan <json> --customer <c> [--dry-run]` | variants / datasources / rendering parameters of placed renderings, all pages in one run (R5) |
| `node harness/scripts/local-data-check.mjs <customer>` | read-only: page `Data` folders and whether any page layout still references them; lists the folders to delete (R5) |
| `node harness/scripts/link-audit.mjs <customer>` | every link / image field in the site holds valid XML; every field's type fits its name and value (R26) |
| `node harness/scripts/component-match.mjs <customer>` | per planned section, the 3 base variants closest in measured shape (`_measure.mjs`; validate-site-plan P17 uses the same shortlist) |
| `node harness/scripts/plan-review.mjs <customer> --open` | gate 2's page: each live section beside its chosen variant, the other shortlisted ones and any flag |
| `node harness/scripts/collect-images.mjs <customer>` | every image of every planned section, traced to its page and section (the only way images enter a demo) |
| `node harness/scripts/attach-images.mjs <customer>` | proposes which uploaded image goes into which Image field (write them with the MCP) |
| `node harness/scripts/media-upload.mjs <customer>` | upload images to the Media Library when `CH_ENABLED=false` (skips files over 50 MB) |
| `node harness/scripts/component-showcase.mjs [--apply]` | the base site's hidden `/Home/components` pages: each component alone, every defined variant (outside demo runs) |
| `node harness/scripts/component-catalog.mjs [--base <url>]` | regenerate `industry-verticals/prospera/docs/ai/catalog/components.md` (fields, templates, what each component can show, screenshots and measured shape per variant; base app running) |
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

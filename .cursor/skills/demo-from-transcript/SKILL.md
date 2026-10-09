---
name: demo-from-transcript
description: Engine behind /new-demo (call /new-demo instead of this unless resuming). Builds a customer demo site from a Gong discovery transcript or an SE interview: story (AAA, Chain of Pain, Command of the Message), page tree, new Sitecore site from scratch, theme, images, content, all pages. Use when the SE says "build a demo from this transcript", "new demo for <customer>" or "resume demo".
---

# Build a demo from a discovery transcript (new site from scratch, multi-page, story-first)

Use when the SE gives a discovery-call transcript (Gong export) and wants a demo site: "build a demo from this transcript", "new demo for <customer>".
It decides WHAT to build (story, pages, sections), then creates a NEW Sitecore site from scratch (new or existing collection, never a copy of another site) and builds every page.
Method: `harness/reference/demo-method.md` (Chain of Pain, AAA, Command of the Message, do the last thing first). Read it first.

## Hard rules (never break)
1. **Only the customer's own folder and its own new site change.** Never edit `industry-verticals/prospera` (the base app) or another customer's folder, and never touch an existing site (ProsperaFinancial included). **No site is ever duplicated, copied, renamed or moved.** Run `node harness/scripts/guard-customer.mjs check <customer>` after every phase. Before EVERY Marketer MCP write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<item path>"`; stop on a failure.
2. **One approval gate** (Phase T4). Do not ask permission step by step afterwards. Stop only on a failed check or an irreversible decision.
3. **Never invent facts.** Pains, quotes, numbers and names come from the transcript, marked *stated* or *inferred*. Gaps stay gaps. Figures not from the transcript or the customer's site are labelled illustrative.
4. **The transcript is never committed** (`intake-transcript.mjs` stores it git-ignored). Quote at most a sentence per row.
5. **Settings and secrets come from `harness/.env.local`.** Never ask the SE to paste secrets into chat.
6. **Existing components are reused as they are on the Sitecore side** (shared templates, renderings, rendering parameters under the project layer). Only the code files are replaced in the customer copy. Register something under /sitecore/layout only for a component that is NEW (not `status: complete` in the manifest).
7. English-only content, Marketer MCP field-name rules and Agent API limits still apply (`.cursor/skills/sitecore-reference/references/agent-api-limitations.md`).

## Phase T0 — Preflight
- `node harness/scripts/env-check.mjs` passes. If `harness/.env.local` is missing or a required value is empty (Content Hub values when `CH_ENABLED=true`): tell the SE exactly which values to fill in, then stop.
- `node harness/scripts/deps-check.mjs --fix`: checks Node, git and Playwright + Chromium (in `harness/`) and installs what is missing itself. Tell the SE only if it still fails after the fix. (The customer app's packages are checked later, once its copy exists: see `demo-new-site`.)
- `<customer>` = lower-case kebab name, also the folder under `industry-verticals/` (e.g. `acme-corp`). It must not be `prospera` or in `PROTECTED_FOLDERS`.
- `node harness/scripts/guard-customer.mjs snapshot <customer>`

## Phase T1 — Intake
`node harness/scripts/intake-transcript.mjs <customer>` (newest file in `harness/inbox/`, or `--file <path>`). Stores it under `industry-verticals/<customer>/docs/ai/demos/<customer>/inputs/`; everything under `docs/ai/demos/` is git-ignored. Non-text exports: ask for a .txt.
**No transcript?** Run `node harness/scripts/intake-transcript.mjs <customer> --none` and do the interview in Phase T2 instead. Never invent a transcript or fill the brief from guesses.

## Phase T2 — Draft the brief
**With a transcript:** read it and fill `harness/templates/demo-brief.template.md` → `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-brief.md`: Audience (AAA), Chain of Pain ranked by emphasis (owner, reason/source, quote, stated/inferred, impact only if given), message map, demo flow with moment 1 = the last thing first (3–6 moments, each with CBI, audience, annoyance → afterward, capability, must-be-visible, check-in question), situation slide, recap. If the SE supplies a colleague's discovery/demo-flow prompt, follow its sections but keep these fields.
**Without a transcript (interview):** ask the SE the questions in `harness/templates/demo-interview.md` (at most 4 per `AskUserQuestion`, free text welcome; skip what the SE already said in the request). Fill the same brief from the answers; every fact is marked *stated by the SE*, and anything the SE does not know stays a gap (do not infer pains or numbers). If the SE already has a demo flow or a discovery prompt, take it as the starting point and only ask for what is missing.
Also collect, in ONE `AskUserQuestion` (max 4 questions, only real gaps): **Sitecore collection** (reuse an existing one — list with `node harness/scripts/sites-api.mjs collections` — or create a new collection named after the customer), customer URL + homepage screenshot for the brand, discovery gaps that block the story.

## Phase T3 — Derive the page tree and sections
Build `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml` from `harness/templates/demo-plan.template.yaml`: copy the story, then write `site.pages`.
- /Home always exists in a new site. Moment 1 (WOW) is on /Home or one click away.
- One page per thing a moment needs to show; pages that prove no moment are not built (except a justified nav target).
- Page types: `page`, `article`, `landing` (confirm in `industry-verticals/prospera/docs/ai/catalog/page-template-registry.yaml`).
- Sections use ONLY ids and variants from `industry-verticals/prospera/docs/ai/catalog/component-registry.yaml` (matching rules: `.cursor/skills/site-analyzer/SKILL.md`). Header and footer are not sections. Each section has `contentSource`: transcript | site | illustrative.
- /Home look and order: run the existing homepage analysis on the screenshot, then apply the story (WOW result first, drop what answers no CBI). Other pages: if the prospect's real site has the page, ask for its URL/screenshot; otherwise compose from the library using the moment.
- Add `site:` → `collection`, `siteName` (customer name) once decided.

## Phase T3b — Theme proposal (shown at the gate, applied after it)
Nothing in an app or in Sitecore changes here; all files stay in the demo folder.
1. With the prospect URL: `node harness/scripts/site-scraper.mjs --url <prospect url> --output industry-verticals/<customer>/docs/ai/demos/<customer>/theme`. If the site blocks it or there is no URL, use the screenshot the SE gives (method and confidence rules: `.cursor/skills/sitecore-extract-theme/SKILL.md`, steps 2-4).
2. Write `.../demos/<customer>/theme/theme.yaml` (format: `industry-verticals/prospera/docs/ai/templates/client-theme.template.yaml`) and `.../theme/theme-proposal.md`: brand colours mapped to Prospera's `site-<customer>` variables (`.cursor/skills/sitecore-reference/references/site-theme-variables.md`) as a hex table, heading and body fonts (a Google Fonts substitute when proprietary), hero/card/button style, light or dark, the screenshot paths and a confidence line (high/medium/low and why).

## Phase T4 — Validate, then the single approval
```
node harness/scripts/validate-story.mjs <customer>
node harness/scripts/validate-site-plan.mjs <customer>
node harness/scripts/bootstrap-plan.mjs <customer>
```
Fix every ❌ yourself. Then show the SE as tables: (1) `story-plan.md`, (2) `site-plan.md` (page tree + components per page), (3) `theme-proposal.md` (colours, fonts, screenshot to compare), (4) the Sitecore plan — collection (new/existing), new site name, site template, what bootstrap will create inside the new site (`bootstrap-plan.md`), (5) gaps, assumptions, illustrative content, manual work to expect (variants, header/footer placement). Ask once: approve / change; the SE can change the story, pages, theme or Sitecore plan in the same answer. Record `userApproved: true`.

## Phase T5 — Build (after approval, no more gates)
1. **Create the site** — follow `.cursor/skills/demo-new-site/SKILL.md` (new/existing collection → NEW site from a site template → local app copy → `.env.local`).
2. **Bootstrap the new site** — follow `.cursor/skills/demo-site-bootstrap/SKILL.md` (probe → Data folders, Headless Variants, Available Renderings, header/footer designs).
3. Then, per `.cursor/skills/sitecore-build-demo/SKILL.md` (same phase numbers) with these changes:
| Phase | What | Change |
|---|---|---|
| 1 + 4 Theme | Apply the APPROVED draft from Phase T3b (do not scrape again): copy `theme/theme.yaml` to `docs/ai/themes/<customer>.theme.yaml` in the customer copy, then write the `site-<customer>` theme block in `src/assets/sass/abstracts/vars/_colors.scss` and `src/lib/site-theme.ts` (steps in `sitecore-extract-theme` / `sitecore-build-demo` phase 4) | uses the approved draft |
| 2.5 Extract content | `harness/scripts/content-extractor.mjs`, `harness/scripts/download-images.mjs` (output into the demo folder) | per page that has a real URL |
| 3 Images | `node harness/scripts/content-hub-upload.mjs <customer>` | does nothing unless `CH_ENABLED=true`; else `images-to-upload.md` |
| 3 Content | datasource items from `content-map.yaml` | one set per page section; item names `<Customer> <PageName> <Component>`; parent = the NEW site's `Data/<folder>` ids from `site-manifest.json`, never the manifest's `main-website` ids |
| 5 / 5.5 | custom components / variants | only for NEW components; existing ones are not re-registered |
| 6 Assemble | `.cursor/skills/demo-build-pages/SKILL.md` | all planned pages |
After each phase: update `demo-progress.yaml`, run the guard `check` (`--allow-build-json` only for step 1).

## Phase T6 — Verify and hand over
1. `get_components_on_page` for every page matches the plan; every datasource is wired.
2. `variant-checklist.md` per page, manual-task list, link check (every CTA/nav target exists).
3. `demo-script.md`: situation slide, then per moment — page URL, what to click, what must be visible, talk track (annoyance → afterward), check-in question — then the recap.
4. Thumbnail (end of `demo-build-pages`), final guard `check`. Summary from `industry-verticals/prospera/docs/ai/templates/demo-summary.template.md`, story summary and demo script first.

## Resume
"Resume demo": read `demo-progress.yaml` and `site.json`; never recreate a site that exists (the scripts refuse); skip finished phases; retry `failed` ones.

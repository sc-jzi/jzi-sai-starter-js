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
- Demo documents open as a rendered preview, not raw markdown: make sure `.vscode/settings.json` has `"workbench.editorAssociations": { "**/docs/ai/demos/**/*.md": "vscode.markdown.preview.editor" }` (add it, keeping the other settings, if it is missing).
- If `harness/reference/marketer-mcp-tools.md` does not exist: write it from the Marketer MCP tool list you can see (every tool name with its parameters, one line each, marking any parameter that sets rendering parameters / variant / display name, or that accepts a partial design or other non-page item id). Read-only; it records what this environment's MCP can really do and is used by the bootstrap and build skills.
- `node harness/scripts/deps-check.mjs --fix`: checks Node, git and Playwright + Chromium (in `harness/`) and installs what is missing itself. Tell the SE only if it still fails after the fix. (The customer app's packages are checked later, once its copy exists: see `demo-new-site`.)
- `<customer>` = lower-case kebab name, also the folder under `industry-verticals/` (e.g. `acme-corp`). It must not be `prospera` or in `PROTECTED_FOLDERS`.
- `node harness/scripts/guard-customer.mjs snapshot <customer>`

## Phase T1 — Intake
`node harness/scripts/intake-transcript.mjs <customer>` (newest file in `harness/inbox/`, or `--file <path>`). Stores it under `industry-verticals/<customer>/docs/ai/demos/<customer>/inputs/`; everything under `docs/ai/demos/` is git-ignored. Non-text exports: ask for a .txt.
**No transcript?** Run `node harness/scripts/intake-transcript.mjs <customer> --none` and do the interview in Phase T2 instead. Never invent a transcript or fill the brief from guesses.

## Phase T2 — Draft the brief
**With a transcript:** read it and fill `harness/templates/demo-brief.template.md` → `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-brief.md`: Audience (AAA), Chain of Pain ranked by emphasis (owner, reason/source, quote, stated/inferred, impact only if given), message map, demo flow with moment 1 = the last thing first (3–6 moments, each with CBI, audience, annoyance → afterward, capability, must-be-visible, check-in question), situation slide, recap. If the SE supplies a colleague's discovery/demo-flow prompt, follow its sections but keep these fields.
**Without a transcript (interview):** ask the SE the questions in `harness/templates/demo-interview.md` (at most 4 per `AskUserQuestion`, free text welcome; skip what the SE already said in the request). Fill the same brief from the answers; every fact is marked *stated by the SE*, and anything the SE does not know stays a gap (do not infer pains or numbers). If the SE already has a demo flow or a discovery prompt, take it as the starting point and only ask for what is missing.
Also collect any real gaps that block the story (customer URL, screenshot) in ONE `AskUserQuestion` (max 4 questions), then the Sitecore choices below.

### Sitecore choices (always ASK; never decide yourself)
Do not pick the collection or the site template for the SE, not even when only one exists and not "to keep things simple". Ask with `AskUserQuestion`, options built from the live environment:
1. `node harness/scripts/sites-api.mjs auth-check` first (it prints the environment and the collections it can see). If it fails, stop and say so.
2. **Collection**: options `New collection named "<Customer>" (Recommended: nothing shared with other demos)` and `Use an existing collection`. Put the collection names found in this environment in the question text so the SE can tell if it is the wrong environment. If existing: ask which one (options from `sites-api.mjs collections`, max 4 + Other).
3. **Site template**: `node harness/scripts/sites-api.mjs templates`. Options are template NAMES (never ids), `Empty` first labelled `(Recommended)` when it exists, then the others (max 4 options, rest via Other). All sites in an existing collection must use the same template: when the SE chose an existing collection, say which template its sites use if you can tell.
4. Site name defaults to the customer's display name; it is shown at the gate, where the SE can change it.
Write the answers into `demo-plan.yaml`: `site.collection`, `site.collectionMode` (`new` | `existing`), `site.template` (the name), `site.siteName`.

## Phase T3 — Derive the page tree and sections
Build `industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml` from `harness/templates/demo-plan.template.yaml`: copy the story, then write `site.pages`.
- Plan /Home as the first page. Whether the new site already has one depends on its template; `demo-site-bootstrap` probes it. Moment 1 (WOW) is on /Home or one click away.
- One page per thing a moment needs to show; pages that prove no moment are not built (except a justified nav target).
- Every page has `path` (name: lower-case, hyphens, alphanumerics only) AND `displayName` (the readable title, e.g. `what-is-corrosion` -> `What is Corrosion`). Page types: `page`, `article`, `landing` (confirm in `industry-verticals/prospera/docs/ai/catalog/page-template-registry.yaml`).
- Sections use ONLY ids and variants from `industry-verticals/prospera/docs/ai/catalog/component-registry.yaml` (matching rules: `.cursor/skills/site-analyzer/SKILL.md`). Header and footer are not sections. Each section has `contentSource`: transcript | site | illustrative.
- /Home look and order: run the existing homepage analysis on the screenshot, then apply the story (WOW result first, drop what answers no CBI). Other pages: if the prospect's real site has the page, ask for its URL/screenshot; otherwise compose from the library using the moment.
- `site:` (`collection`, `collectionMode`, `template`, `siteName`) comes from the SE's answers in Phase T2; do not fill it in any other way.

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
Fix every ❌ yourself. Then **write the whole plan as normal chat text, and only then ask**. The question widget shows only the question, and the SE must not have to open tool output or files to judge the plan. Use the files as sources, but print everything below in the message itself, in this order:

1. **Story**: the situation in two lines; the ranked pains (id, pain, who feels it, *stated*/*inferred*); the demo moments (number, title, audience, what they see; moment 1 marked *last thing first*).
2. **Theme**: table of the `site-<customer>` colours (variable → hex), heading and body font (plus the substitute when proprietary), tone, confidence and why, and the path of the screenshot to compare with the live site.
3. **Pages**: the page tree, then for EACH page a table: position, component, variant, content source (transcript / site / illustrative), moment it proves.
4. **Components**: one table of every component used (name, variants used, on which pages) marked *reused* (already registered in Sitecore) or *new*, and anything that needs custom work.
5. **Sitecore**: collection (new or existing, name), site name, site template (name), language, and what bootstrap will create inside the new site (from `bootstrap-plan.md`).
6. **Gaps and manual work**: assumptions, illustrative content, and what the SE must still do by hand (variants if the MCP cannot set them; the editing host if `SITECORE_ENVIRONMENT_ID` is empty).
7. **Open the full documents** (end of the message, one link per line, workspace-relative so a click opens them; they open as a rendered preview thanks to the setting from Phase T0; if they open as raw text, say "press Ctrl+Shift+V"):
   - `[Demo brief](industry-verticals/<customer>/docs/ai/demos/<customer>/demo-brief.md)`
   - `[Story plan](industry-verticals/<customer>/docs/ai/demos/<customer>/story-plan.md)`
   - `[Site plan](industry-verticals/<customer>/docs/ai/demos/<customer>/site-plan.md)`
   - `[Theme proposal](industry-verticals/<customer>/docs/ai/demos/<customer>/theme/theme-proposal.md)`
   - `[Bootstrap plan](industry-verticals/<customer>/docs/ai/demos/<customer>/bootstrap-plan.md)`
   List only files that exist. Never make the SE hunt for a path.

Then ask once with `AskUserQuestion`: approve / change (the SE can change story, pages, theme or Sitecore choices in the same answer). On a change: apply it, re-run the validators, show the changed sections again and ask again. On approval write `userApproved: true` and `approvedAt: <ISO time>` at the top level of `demo-plan.yaml`. `sites-api.mjs create-site --apply` refuses to run without it, and without `site.collection`, `site.template` and `site.siteName` matching what it is told to create.

## Phase T5 — Build (after approval, no more gates)
1. **Create the site** — follow `.cursor/skills/demo-new-site/SKILL.md` (new/existing collection → NEW site from a site template → local app copy → `.env.local`).
2. **Bootstrap the new site** — follow `.cursor/skills/demo-site-bootstrap/SKILL.md` (probe → Data folders, Headless Variants, Available Renderings, derived page templates, Header/Footer partial designs, Page Designs).
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

# Demo harness

Tell Cursor about a prospect (a Gong discovery transcript) and it plans the demo story, creates a **new SitecoreAI site from scratch** (new or existing collection), builds the theme, uploads images and creates every page, datasource and component. You approve the plan once.

Everything is configured in **`harness/.env.local`** (git-ignored; copy `harness/env.example`). Nothing needs duplicating; this repo carries the base app (`industry-verticals/prospera`) and its shared component definitions.

## One-time
1. `cp harness/env.example harness/.env.local` and fill it in (automation client at minimum).
2. `node harness/scripts/env-check.mjs`
3. For the site thumbnail: `npm install --no-save playwright` and `npx playwright install chromium` (skip it and the thumbnail becomes a manual task).

## Per demo
1. Drop the transcript into `harness/inbox/`.
2. In Cursor: *"Build a demo from this transcript for <customer>"* (skill `demo-from-transcript`).
3. Review the plan (story, pages, components, Sitecore collection/site) and approve.
4. Cursor creates the site, bootstraps it, builds all pages. You do the listed manual steps (header/footer placement, variants).

## Layout
| Path | What |
|---|---|
| `harness/.env.local` | credentials and switches |
| `.cursor/skills/` | **all** skills (the only place). Type `/` in Cursor: `demo-*` is the transcript flow, `sitecore-*` build components/pages, `content-sdk-*` are code skills, `sitecore-reference` holds shared rules and reference |
| `harness/scripts/` | intake, validators, isolation guard, Sites API (create site, list templates, upload thumbnail), screenshot, new-site, bootstrap plan, Content Hub wrapper |
| `harness/templates/`, `harness/reference/` | plan/brief/progress templates, demo method, `sitecoreai-apis.md` (the SitecoreAI API docs we build on) |
| `harness/inbox/` | transcripts waiting (never committed) |
| `industry-verticals/<customer>/` | the demo's own app copy; `docs/ai/demos/<customer>/` holds everything the demo produces |
| `industry-verticals/prospera/` | the base app and shared definitions: read-only, never edited by a demo |

## Isolation
`guard-customer.mjs` fails a run if anything outside `industry-verticals/<customer>/` changed (setup may also add one `renderingHosts` entry to `xmcloud.build.json`) and blocks Sitecore writes outside the demo's own site. The Sites API only creates; it never copies, renames or deletes.

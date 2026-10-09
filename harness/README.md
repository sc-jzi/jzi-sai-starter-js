# Demo harness

Tell Cursor about a prospect (a Gong discovery transcript) and it plans the demo story, creates a **new SitecoreAI site from scratch** (new or existing collection), builds the theme, uploads images and creates every page, datasource and component. You approve the plan once.

Everything is configured in **`harness/.env.local`** (git-ignored; copy `harness/env.example`). Nothing needs duplicating; this repo carries the base app (`industry-verticals/prospera`) and its shared component definitions.

## One-time
1. `cp harness/env.example harness/.env.local` and fill it in (automation client at minimum).
2. `node harness/scripts/env-check.mjs`
3. `node harness/scripts/deps-check.mjs --fix` installs Playwright + Chromium (theme scrape, content extraction, site thumbnail). Cursor runs this itself at the start of a demo, and `npm install` in the customer app after the copy is made.

## Per demo
1. Optional: drop the Gong transcript into `harness/inbox/`.
2. In Cursor type `/new-demo create a demo for <prospect> (<website>), <anything you know>`. It uses the transcript if one is waiting, interviews you if not, and resumes if the demo was started before.
3. Review the plan once (story, pages, theme, Sitecore collection/site template) and approve.
4. Cursor creates the site, bootstraps it, builds all pages and the thumbnail. You do the listed manual steps (variants, header/footer placement, push the code).

## Layout
| Path | What |
|---|---|
| `harness/.env.local` | credentials and switches |
| `.cursor/skills/` | **all** skills (the only place). Type `/` in Cursor: `demo-*` is the transcript flow, `sitecore-*` build components/pages, `content-sdk-*` are code skills, `sitecore-reference` holds shared rules and reference |
| `harness/scripts/` | intake, validators, isolation guard, Sites API (create site, list templates, upload thumbnail), editing host, deps-check, site scraper / content extractor / screenshot (Playwright), new-site, bootstrap plan, Content Hub wrapper |
| `harness/templates/`, `harness/reference/` | plan/brief/progress templates, demo method, `sitecoreai-apis.md` (the SitecoreAI API docs we build on) |
| `harness/inbox/` | transcripts waiting (never committed) |
| `industry-verticals/<customer>/docs/ai/demos/` | everything about the opportunity (brief, plan, theme draft, script, ids): git-ignored, stays on the SE's machine. The customer app code beside it is committed |
| `industry-verticals/<customer>/` | the demo's own app copy; `docs/ai/demos/<customer>/` holds everything the demo produces |
| `industry-verticals/prospera/` | the base app and shared definitions: read-only, never edited by a demo |

## Isolation
`guard-customer.mjs` fails a run if anything outside `industry-verticals/<customer>/` changed (setup may also add one `renderingHosts` entry to `xmcloud.build.json`) and blocks Sitecore writes outside the demo's own site. The Sites API only creates; it never copies, renames or deletes.

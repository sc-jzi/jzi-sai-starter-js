# Harness rules: the one source

Every demo skill follows these rules. A skill refers to a rule by its number (for example "R7") instead of restating it; when a skill and this file
disagree, **this file wins** and the skill is the bug. Change a rule here, once. Scripts that enforce a rule are named next to it.

## Run and approvals
- **R1 Two approvals, nothing else.** Gate 1 is the story alone (`demo-from-transcript` T2b); gate 2 is the build plan (T4). After the SE's yes, run
  `node harness/scripts/run-gate.mjs approve <customer> story|plan`, never set `storyApproved` / `userApproved` by hand. A later change to the story or
  plan (sections, components, `droppedLiveSections`, `sourceUrl`) is shown to the SE and approved again; the plan is never changed to make a check pass.
  The only other questions after approval are R2's and a decision that is truly impossible to assume. *Enforced: run-gate (approval hashes).*
- **R2 Marketer MCP connected first.** `list_sites` must answer before anything else; not connected → send the auth request, ask once; a timeout stops the
  run with `blockedOn: marketer-mcp-auth` and the SE resumes with `/resume-demo <customer>`.
- **R3 The run ends only when `node harness/scripts/run-gate.mjs check <customer>` exits 0.** Do its items in the printed order (build first). The stop
  hook restarts an unfinished run; never end a turn, summarise or hand over while the gate is red.
- **R4 Core work is built, not deferred.** A line goes into `manual-tasks.md` under "Open" only as `BLOCKED after 2 attempts: "<error>"` with both attempts
  logged by `run-gate.mjs block`. Information that is not a task goes under `## Info`; too-large files under `## Missing assets` (written by the upload
  scripts). Nothing written into `manual-tasks.md` waives a looks difference (R15). *Enforced: run-gate (manual).*

## Writing to Sitecore
- **R5 Marketer MCP first.** Every write the MCP supports goes through the MCP (`create_content_item`, `update_fields_on_item`, `create_page`,
  `add_component_on_page`, `set_component_datasource`, `remove_component_on_page`, ...), followed by a read-back. Scripts write directly (Authoring
  GraphQL / Sites API) ONLY for what the MCP cannot do: creating the collection and site (`sites-api.mjs`), uploading media (`media-upload.mjs`,
  `content-hub-upload.mjs`), setting a variant or rendering parameter on a placed rendering when the MCP route (writing the layout XML with
  `update_fields_on_item`) is refused (`layout-variant.mjs apply`), and the editing host. Scripts may always READ Sitecore to verify (the run gate,
  `link-audit.mjs`, the `attach-images.mjs` dry run). Never write a one-off script that creates items or layouts.
- **R6 Datasources live under the site's Data folder:** `/sitecore/content/<collection>/<site>/Data/<component folder>/<Customer> <Page> <Component>`,
  never under a page (`<page>/Data`), never in another site. Create the item first, place the component, point it at the item
  (`set_component_datasource`), delete the page-local item `add_component_on_page` made. Exceptions: the Header/Footer partial designs' own Data, and
  Navigation, whose datasource is the Home item. *Enforced: run-gate (content).*
- **R7 Link fields hold link XML.** Internal: `linktype="internal" id="{GUID}"` (a `url` next to the id is fine, a url without an id drops the whole
  datasource); external: `linktype="external" url="https://..."` or `#`; also `mailto`, `media`, `anchor`. Build values with `link-xml.mjs make`; a site
  path such as `/about-us` is always an internal link with the page id. *Enforced: link-xml check, link-audit, run-gate (links).*
- **R8 Image fields hold image XML, never a URL.** Upload first (Content Hub, or the Media Library when `CH_ENABLED=false`), then write the manifest's
  `imageFieldXml`; images enter a demo only through `collect-images.mjs` (each traced to its page and section). A file over 50 MB is not uploaded to the Media Library (Experience Edge cannot publish it) and is listed under `## Missing assets`;
  the run carries on. Uploaded is not attached: every image of a built section ends up in that component's Image field (`attach-images.mjs` proposes
  each write; make it with `update_fields_on_item`, R5). *Enforced: run-gate (images, looks IMAGES).*
- **R9 Header and footer are partial designs** on template `{FD2059FD-6043-4DFE-8C04-E2437CE87634}`, listed in every Page Design. `{C3CEB23C-...}` is the
  Partial Designs folder, not a partial. Never copy header or footer renderings onto a page. *Enforced: run-gate (partials, placement).*
- **R10 Pages.** Item names are lower-case-hyphen; the display name (`__Display name`, en) is the plan's `displayName`, or else the item name in Title Case
  (`what-is-corrosion` → `What Is Corrosion`). Navigation: only `navGroup: main` pages directly under Home are visible in the main navigation; every
  other page has `Main Navigation` ticked in `NavigationFilter`. *Enforced: run-gate (content).*
- **R11 Localhost reads master** (the app's `.env.local` holds a preview context): no publish while building. Publishing is only for the deployed
  (Vercel) site, a hand-over task.

## Building the pages
- **R12 Mirror the live site, section by section.** A page that exists on the prospect's site is built as that page: every live section planned
  (`liveSection`) or dropped with a reason; the story only adds sections a moment needs (`added: true`). Advertisement slots are never built. The footer
  is never dropped (R9). *Enforced: validate-site-plan P12/P12b/P12c.*
- **R13 One component per section, chosen from its screenshot.** Open the section's crop (`component-crops.md`), then reuse a registry component of the
  same shape (with the client variant or look) or build a new one (`fit: new`). Rich Text is only a heading and paragraphs: never images, buttons,
  cards, columns, lists, an FAQ, a logo wall, a video, a form, a carousel, never with a `look`, never section HTML in a field.
  *Enforced: validate-site-plan P16, component-crops, run-gate (placement).*
- **R14 Measurements come from the scripts.** `nav.json`, `header-styles*.json`, `sections*.json` are never edited by hand. A wrong result is re-measured
  with the script's override (`nav-extract --root`, `header-styles --eyebrow/--main`, `section-capture --selector`); a wrong demo is fixed in the
  variant/SCSS, never in the measurement. Only when a site blocks headless capture entirely may the numbers be read from the SE's screenshots into the
  same JSON shape, marked `"source": "screenshot"`. *Enforced: run-gate (verdict reference hash).*
- **R15 Looks gates.** `node harness/scripts/looks-gates.mjs <customer>` against the running app compares the header and every mirrored page. Build gaps
  (missing section, footer columns or labels, sample content, render errors, missing imagery) are always built. Measurement differences are fixed;
  after two fix attempts the SE decides on what is left: `looks-review.mjs <customer> --open` (one page, live and built side by side), ONE question,
  `run-gate.mjs accept <customer> all|none|<numbers> --answer "<the SE's words>"`. Accepted differences are listed in the hand-over; never accept
  on the SE's behalf. *Enforced: run-gate (looks, accepted-differences.json).*

## Code
- **R16 Code only in the customer's app copy** (`industry-verticals/<customer>/`); `industry-verticals/prospera` and other customers' folders are never
  edited. Other demos are invisible: never open, list or search them. *Enforced: guard-customer.*
- **R17 The app always builds.** After every code change: `node harness/scripts/build-check.mjs <customer>` (`--quick` for a typecheck in between).
  Never commit an app that does not build; never bypass the pre-commit hook. An error in code you did not touch is still fixed when the fix is
  clear and small (say so); otherwise tell the SE what fails and where. *Enforced: pre-commit hook, run-gate (build).*
- **R18 Nothing prospect-specific in the shared harness** (`harness/`, `.skills/`, `.cursor/`, `.claude/`, `CLAUDE.md`): no prospect name, website,
  Sitecore site name or item ids, and no prospect's scripts, data dumps, notes or readmes. One-off scripts for a demo go in
  `industry-verticals/<customer>/docs/ai/demos/<customer>/tmp/` and import the helpers with
  `import { ENV, authoringClient } from "../../../../../../../harness/scripts/_lib.mjs";`. A lesson for every demo is written without the name.
  *Enforced: name-check (pre-commit hook, run-gate).*
- **R19 Skills live in `.skills/`.** `.cursor/skills` and `.claude/skills` hold generated stubs only; after editing a skill run
  `node harness/scripts/sync-skills.mjs`. *Enforced: pre-commit hook.*

## Facts
- **R20 Never invent facts.** Pains, quotes, numbers and names come from the transcript, RFP or the SE, marked stated / rfp / inferred; gaps stay gaps;
  illustrative figures are labelled. Inputs are never committed (`intake-materials.mjs` stores them git-ignored); quote at most a sentence per row, never
  paste whole RFP documents into chat. Secrets come from `harness/.env.local` and are never pasted into chat. Content is English only.

## Sitecore scope and safety
- **R21 Only this demo's own new site changes.** Never touch an existing site; no site is ever duplicated, copied, renamed or moved. Before EVERY
  Sitecore write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<item path>"`, stop on a failure; after every phase:
  `guard-customer.mjs check <customer>`. *Enforced: guard-customer.*
- **R22 Existing components are reused as they are on the Sitecore side** (shared templates, renderings, rendering parameters under the project layer);
  only their code is replaced in the customer copy. Register something under /sitecore/layout only for a component that is NEW (not
  `status: complete` in the manifest). Marketer MCP field-name rules and the Agent API limits apply (`.skills/sitecore-reference/references/agent-api-limitations.md`).
- **R23 No fire-and-forget writes.** Writes run in the foreground, one result checked (read back) per item. A script or job that exits non-zero, or a
  read-back that disagrees, is a FAILED step: fix it before saying the work is done. Only the app dev server runs in the background. Timestamps come
  from the real clock (`new Date().toISOString()`). On Windows PowerShell write a `.mjs` file instead of inline `node -e` (quotes get mangled).
- **R24 A front-end workaround for a Sitecore feature is disclosed.** Code that imitates a Sitecore behaviour (for example a cookie that drives
  personalization) is allowed only when Sitecore's own mechanism cannot work on the demo host. The Sitecore rules are still built; the workaround is
  named at the approval gate under "Personalization / behaviour" and in `demo-script.md`, with what the SE does instead in Pages.

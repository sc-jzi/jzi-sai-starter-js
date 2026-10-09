---
name: demo-new-site
description: Create the customer's NEW Sitecore site (new or existing collection) via the Sites API and its local app copy. Use as phase 1 of demo-from-transcript or when the SE says "create the site for <customer>".
---

# Create a NEW Sitecore site from scratch (never a duplicate)

Called by `sitecore-demo-from-transcript` (Phase T5 step 1). Replaces the old duplicate-and-rename flow: duplicates stay in the source collection and cannot be moved by API, and a copy drags the source site's content along.

## Rules
- Sites API only creates. It never copies, renames, moves or deletes. `sites-api.mjs` refuses an existing site name and protected names.
- Credentials: `harness/.env.local` (`SITECORE_AUTOMATION_CLIENT_ID/SECRET`, optional `SITECORE_ENVIRONMENT_ID`). Never print or ask for secrets in chat.
- Decision to confirm at the approval gate: collection (existing or new) and site name. A new collection per customer is the safest (nothing shared with other demos).

## Steps
1. `node harness/scripts/sites-api.mjs auth-check` — stop with a clear message if it fails.
2. Collection: also from the plan (`site.collection`, `site.collectionMode`). Existing → `node harness/scripts/sites-api.mjs collections` and take its id. New → use its name. (Standalone use: ask the SE, never choose for them.)
3. Template: the SE chose it in `demo-from-transcript` Phase T2 and it is `site.template` in `demo-plan.yaml`. Use exactly that name (`--template "<name>"`); do not substitute another or ask again. Only when running this skill on its own (no plan): run `node harness/scripts/sites-api.mjs templates` and ask the SE which name to use, with `Empty` marked recommended; never show ids. Record the name in `demo-progress.yaml`.
4. Dry run: `node harness/scripts/sites-api.mjs create-site --customer <customer> --site-name "<Customer Name>" --template "<template name>" (--collection-id <id> | --collection-name "<name>")`. Check the output matches the approved plan.
5. Create: same command with `--apply` (it refuses unless `demo-plan.yaml` has `userApproved: true` and the same collection, template and site name). SitecoreAI can take ~2 minutes; the script waits for the job and writes `industry-verticals/<customer>/docs/ai/demos/<customer>/site.json` (collection, site name, template name, ids).
6. Local app: `node harness/scripts/new-site.mjs <customer>` (dry run), then `--apply`. It copies `industry-verticals/prospera` to `industry-verticals/<customer>` (code only: no other demo's docs, no secrets), creates `.env.local` from `harness/.env.local`, sets `docs/ai/config/project.yaml` (siteCollection, siteName), and adds `renderingHosts.<customer>` to `xmcloud.build.json`.
7. `node harness/scripts/guard-customer.mjs check <customer> --allow-build-json`.
8. Packages: `node harness/scripts/deps-check.mjs --customer <customer> --fix` (runs `npm install` in the customer app if `node_modules` is missing; never in the base app).
9. Editing host: `node harness/scripts/editing-host.mjs --customer <customer>` (dry run), then `--apply`. It runs the Sitecore CLI `cloud editinghost create` for the name in `xmcloud.build.json`. If it fails (no CLI, not logged in, environment type not supported) do not stop: add "create the editing host in Deploy" to the manual tasks with the fallback steps the script prints. The host builds from the linked repo, so the SE must push the code; the first build is where problems show.
10. Manual for the SE: Edge context ids / editing secret if `new-site` reported them empty, `git push`, publishing item ids.
11. Update `demo-progress.yaml` (`siteCreated`, collection, site name, ids). Continue with `sitecore-site-bootstrap`.
12. Thumbnail: done at the END of `demo-build-pages` once the homepage exists (see that skill). The site card in SitecoreAI shows it.

API reference: `harness/reference/sitecoreai-apis.md` (Sites API: https://api-docs.sitecore.com/sai/sites-api). Check it if a call fails or Sitecore has changed an endpoint.

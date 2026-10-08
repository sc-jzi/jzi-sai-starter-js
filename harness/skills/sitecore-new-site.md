# Skill: Create a NEW Sitecore site from scratch (never a duplicate)

Called by `sitecore-demo-from-transcript` (Phase T5 step 1). Replaces the old duplicate-and-rename flow: duplicates stay in the source collection and cannot be moved by API, and a copy drags the source site's content along.

## Rules
- Sites API only creates. It never copies, renames, moves or deletes. `sites-api.mjs` refuses an existing site name and protected names.
- Credentials: `harness/.env.local` (`SITECORE_AUTOMATION_CLIENT_ID/SECRET`, optional `SITECORE_ENVIRONMENT_ID`). Never print or ask for secrets in chat.
- Decision to confirm at the approval gate: collection (existing or new) and site name. A new collection per customer is the safest (nothing shared with other demos).

## Steps
1. `node harness/scripts/sites-api.mjs auth-check` — stop with a clear message if it fails.
2. Collection: the choice was made in the brief/approval. Existing → `node harness/scripts/sites-api.mjs collections` and take its id. New → use its name.
3. Template: `node harness/scripts/sites-api.mjs templates`. Use `SITE_TEMPLATE_ID` from `.env.local` if set; otherwise show the list and ask the SE once which template to use (all sites in a collection must use the same template; prefer the headless/Next.js one). Record the choice in `demo-progress.yaml`.
4. Dry run: `node harness/scripts/sites-api.mjs create-site --customer <customer> --site-name "<Customer Name>" --template-id <id> (--collection-id <id> | --collection-name "<name>")`. Check the output matches the approved plan.
5. Create: same command with `--apply`. SitecoreAI can take ~2 minutes; the script waits for the job and writes `industry-verticals/<customer>/docs/ai/demos/<customer>/site.json` (collection, site name, ids).
6. Local app: `node harness/scripts/new-site.mjs <customer>` (dry run), then `--apply`. It copies `industry-verticals/prospera` to `industry-verticals/<customer>` (code only: no other demo's docs, no secrets), creates `.env.local` from `harness/.env.local`, sets `docs/ai/config/project.yaml` (siteCollection, siteName), and adds `renderingHosts.<customer>` to `xmcloud.build.json`.
7. `node harness/scripts/guard-customer.mjs check <customer> --allow-build-json`.
8. Optional editing host: `dotnet sitecore cloud editinghost create --cm-environment-id <id> --name <customer>` when the SE has the CLI logged in; otherwise list it under manual tasks. Also manual: Edge context ids / editing secret if `new-site` reported them empty, `npm install`, publishing item ids.
9. Update `demo-progress.yaml` (`siteCreated`, collection, site name, ids). Continue with `sitecore-site-bootstrap`.

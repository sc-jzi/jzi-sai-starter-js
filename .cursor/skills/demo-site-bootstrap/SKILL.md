---
name: demo-site-bootstrap
description: Prepare a freshly created site: Data folders, Headless Variants, Available Renderings, header/footer partial designs, reusing shared components. Use right after demo-new-site and before building pages.
---

# Bootstrap a freshly created site so the shared components work in it

A site made from a site template has the standard presentation scaffolding but none of the project-specific items that ProsperaFinancial-style sites carry. The shared definitions (templates, renderings, rendering parameters under the project layer, e.g. `/sitecore/layout/Renderings/Project/fmc-custom-demo`) already exist and are REUSED. This skill creates only what lives INSIDE the new site. Use the Marketer MCP; limits are in `.cursor/skills/sitecore-reference/references/agent-api-limitations.md`.

## Rules
- Run `node harness/scripts/bootstrap-plan.mjs <customer>` first; it lists exactly what is needed (`bootstrap-plan.md/json`).
- Before every write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<path>"`.
- Use ids from the manifest ONLY for shared things (templates, folder templates, renderings, rendering parameters). Site-level ids in the manifest (`/content/main/main-website/...`, variant definition ids, example items) belong to another site: never use or write them.
- Record every id you create or find in `industry-verticals/<customer>/docs/ai/demos/<customer>/site-manifest.json`; all later phases read site-level ids from there.
- Do not claim a write worked until you re-read it (several fields are silent-writes; see `sitecore-marketer-mcp-reference.md`).

## Step 0 — Probe (read-only)
With `get_content_item_by_path`, list and record in `site-probe.json`: `/sitecore/content/<coll>/<site>` children; `Home`; `Data`; `Presentation/{Available Renderings, Headless Variants, Partial Designs, Page Designs, Styles}`; `Settings`. Also confirm the shared layer exists (`renderingsRoot`, `projectTemplatesRoot` from `docs/ai/config/project.yaml`). If the shared layer is missing in this environment or collection, STOP and tell the SE: the components are not registered there and that is a separate (new-component) job.
The probe decides each step below: create only what is absent.

## Step 1 — Data root and datasource folders
If `Data` is missing, create it (use the folder template the probe shows other Data roots use; if none, ask the SE once). For each component with a datasource in `bootstrap-plan.json`: create `Data/<datasourceFolderName>` with `create_content_item`, template = `folderTemplateId`. Skip existing. The rendering's datasource location query looks under `$site/Data` for that folder template, so the template and the folder name must match the plan exactly.

## Step 2 — Headless Variants
For each component: ensure `Presentation/Headless Variants/<container>` exists (template **Headless Variants**), then one **Variant Definition** per variant needed (always `Default`), names exactly as the TSX exports (`industry-verticals/prospera/.cursor/skills/sitecore-add-variants/SKILL.md`). Record the variant ids in `site-manifest.json` (they feed the variant checklist).

## Step 3 — Available Renderings
Open `Presentation/Available Renderings/Page Content` (or the probe's equivalent). Its field cannot always be read through MCP. If you can read it: write the existing value + the plan's ids (concatenate, never replace). If you cannot read it, do NOT write: save the pipe-separated list from `bootstrap-plan.md` to `available-renderings.txt` and ask the SE to paste it after the existing value in Content Editor (one minute). The build cannot add components until this is done; ask once and wait.

## Step 4 — Header / footer
NavigationHeader and SiteFooter cannot be added by API. Create the Header and Footer Partial Designs (and the Page Design that uses them) from the probe's existing patterns (`Partial Designs`, `Page Designs`), then tell the SE the one manual step: in Pages, open the Header partial design, add NavigationHeader (data source = Home) and in the Footer partial design add SiteFooter. Mark it in the manual tasks. Verify afterwards that a created sub-page renders both.

## Step 5 — Verify and hand on
Re-read every created item (`get_content_item_by_path`), compare with the plan, list gaps. Write `site-manifest.json`: `{ siteRoot, dataRoot, dataFolders: {Component: id}, variants: {Component: {Variant: id}}, availableRenderingsItem, partialDesigns, pageDesign, home }`. Run the guard `check`. Then continue with content (Phase 3) and `sitecore-build-pages`.
If any step fails twice, stop and report what exists, what is missing, and which manual step unblocks it.

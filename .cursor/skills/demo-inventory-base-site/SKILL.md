---
name: demo-inventory-base-site
description: One-time, read-only discovery of the Prospera base site in Sitecore to fill docs/ai/manifests/sitecore-manifest.yaml and config/project.yaml, so demos can reuse its renderings. Run when the manifest is empty or the base site changed.
---

> **Where this runs:** open the repo root. This is the ONE skill that writes into `industry-verticals/prospera/docs/ai/` (manifest and project config only). It never writes to Sitecore: every MCP call is a read.

# Inventory the base site

Why: the manifest is not generated from code. Code tells us which components exist; only Sitecore knows their rendering ids, templates and datasource folders. `/demo-site-bootstrap` and `bootstrap-plan.mjs` need those ids to reuse the base site's renderings in a new customer site.

## Inputs
- Base site collection and name: ask the user once (the Prospera site they deployed), or read from `harness/.env.local` (`BASE_SITE_COLLECTION`, `BASE_SITE_NAME`) if present.

## Steps
1. **Code side.** Run `node harness/scripts/inventory-components.mjs --out harness/.tmp-inventory.json` (git-ignored scratch). It lists every component in `.sitecore/component-map.ts` with its folder, variants, field names and placeholders. Skip entries with `sitecoreRendering: false`.
2. **Layer.** With `get_content_item_by_path`, find the project layer: look under `/sitecore/layout/Renderings/Project/` and `/sitecore/templates/Project/` for the folder that holds the base site's renderings (match a few names from step 1, e.g. `HeroBanner`, `ThreeColumnCta`). Record `renderingsRoot` and `projectTemplatesRoot`.
3. **Per component.** For each inventoried component find: the rendering item (id, path), its datasource template and folder template (ids, names), the rendering-parameters template, and the Headless Variants container under `/sitecore/content/<collection>/<site>/Presentation/Headless Variants/` (variant names should match the code's named exports). A component with no datasource template is `contextOnly`.
4. **Write.** Set `siteCollection`, `siteName`, `renderingsRoot`, `projectTemplatesRoot` in `industry-verticals/prospera/docs/ai/config/project.yaml` and in the manifest `project:` block. Add one manifest entry per component using the shape documented at the bottom of the manifest and in `.cursor/skills/sitecore-maintain-manifest/SKILL.md` (`status: complete` only when the rendering id was found).
5. **Report** components found in code but missing in Sitecore, and renderings in Sitecore with no code. Do not fix either here.
6. Delete `harness/.tmp-inventory.json`, then run `/sitecore-validate-manifest` read-only to confirm.

## Rules
- Read-only against Sitecore. No create/update/delete MCP calls.
- Never touch anything in `industry-verticals/prospera` other than `docs/ai/manifests/sitecore-manifest.yaml` and `docs/ai/config/project.yaml`.
- If a lookup is ambiguous, list the candidates and ask; do not guess an id.

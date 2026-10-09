---
name: demo-build-pages
description: Build every planned page of a customer demo via Marketer MCP (components, datasources, variants, links, navigation). Use after demo-site-bootstrap, or to add/fix pages of an existing demo.
---

# Create and assemble ALL planned pages (replaces "Home only" Phase 6)

Called by `sitecore-demo-from-transcript` (Phase T5) after the NEW site is created and bootstrapped, and theme, images and content items exist. Input: the approved
`industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml` (`site.pages`) and `content-map.yaml`.
Use the Marketer MCP tools. Limits: `.cursor/skills/sitecore-reference/references/agent-api-limitations.md` (read-only reference; no variants via API, no context-only components, no component removal).

## Rules
1. Before every MCP write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<item path>"`. Stop on ❌. Pages are only ever created under `/sitecore/content/<collection>/<site>/Home` of THIS demo's site.
2. **Existing components are reused as they are on the Sitecore side.** Use rendering ids from the manifest (`docs/ai/manifests/sitecore-manifest.yaml`, shared layer only). Site-level ids (Home, Data folders, variants) come from `site-manifest.json`, never from the manifest's `main-website` entries. Never create or edit renderings, templates or datasource templates for a component whose manifest status is `complete`. Only NEW components (no manifest entry) are registered under /sitecore/layout, via their create-* skills.
3. Resume-safe: before creating anything, look it up (`get_content_item_by_path`). Record every id in `demo-progress.yaml` → `pages[]`.
4. Parents before children, in `site.pages` order.

## Steps
**1. Resolve the site.** `get_content_item_by_path("/sitecore/content/<collection>/<site>/Home")` → `homeId`. Page templates come from `site-manifest.json` → `pageTemplates` (the DERIVED templates created by bootstrap step 4, which inherit the shared ones). Use the derived id for the page's `pageType`; fall back to the Home page's template or the registry only if `pageTemplates` has no entry, and say so.

**2. Create the first sub-page only, then check it.** Create the first non-Home page:
`create_page(name=<last path segment>, parentId=<parent page id>, templateId=<page template id>)`.
Set the display name right after creating each page: `update_fields_on_content_item(fields={"__Display name": <displayName from the plan>})` (the item NAME stays lower-case-hyphen, e.g. `what-is-corrosion`; the display name is `What is Corrosion`). Re-read to confirm; if the field is refused, check `harness/reference/marketer-mcp-tools.md` for another way once, then add it to the manual tasks. Do the same for Home and for datasource items whose name is not already readable. Set its page fields (`Title` and the SEO fields listed under `inheritedFieldsUsed` in the registry) with `update_fields_on_content_item`, using field names from `get_content_item_by_id`.
Ask the SE to open it in Pages and confirm the header and footer render (this also confirms the manual header/footer step from bootstrap) and the site navigation looks right. (One short question; this proves the Page Design is inherited before N pages are created.) If header/footer are missing: stop and report; do not try to add context-only components by API.

**3. Create the remaining pages** the same way, parents first. Update progress after each.

**4. Components per page.** For each page, for each section top to bottom (`sections[]`):
- `add_component_on_page(pageId, componentRenderingId=<manifest rendering id>, placeholderPath="headless-main", componentItemName=<ComponentName>, insertAfterComponentId=<previous>)`.
- `set_component_datasource(pageId, componentId, datasourceId=<id from content-map.yaml for THIS page + section>)`.
- A new site's /Home starts with whatever the site template placed on it: re-wire what the plan keeps (match by component name and order), add the missing ones, and list leftovers that cannot be removed in the manual-cleanup list (API cannot remove components).
- New sub-pages start empty, so nothing needs cleaning.
- Header, footer and other context-only components are NOT added to pages (they come from the partial designs and Page Designs of bootstrap step 5).
- Pages built on a derived template may inherit presentation from the shared standard values (e.g. an Author Widget whose datasource points at another site's author). Check `get_components_on_page` on the first article page: re-point such datasources to an item you created under this site's `Data` (`set_component_datasource`); if that is not possible, list it as manual cleanup. Never leave another site's item wired in.
- If `add_component_on_page` fails because a branch/insert template is missing in this environment (e.g. `/sitecore/templates/Branches/Project/Verticals/Questions`), do not invent the branch; skip that component, record it under "environment gaps" and tell the SE.

**5. Variants.** First check `harness/reference/marketer-mcp-tools.md`: does `add_component_on_page` (or another tool) accept rendering parameters / a variant? If YES, pass the variant id from `site-manifest.json` (headless variant `FieldNames`) when adding the component, then confirm with `get_components_on_page`; on the first non-Default section do this once and write the outcome (works / error text) into the same file. If NO or it fails: the API documentation lists no such parameter and earlier attempts failed (`agent-api-limitations.md`), so for every non-Default section add a row to `variant-checklist.md` grouped by page: page path, position, component, needed variant, variant id. Estimated time = 15 s per row.

**6. Links and navigation.** Every CTA/nav link in the content must target a planned page path (`/<name>`). After creating pages, check: does the site's main navigation list the new pages? If navigation comes from a datasource or settings item (see `.cursor/skills/sitecore-reference/references/sitecore-content-resolvers.md`), update it with `update_fields_on_content_item`; if it cannot be set by API, put one line in the manual-task list.

**7. Verify.** For each page: `get_components_on_page` → compare to the plan (component + order), check every datasource is non-empty, report gaps. Mark `pages[].status: verified`.

**8. Site thumbnail.** Once the Home page renders, give the site a thumbnail so it is recognisable in SitecoreAI:
1. Pick the homepage URL. Prefer the running local app (`npm run dev` in `industry-verticals/<customer>`, usually `http://localhost:3000/`, after the pages are published or in preview); otherwise the published/preview URL. Ask the SE if neither is up.
2. `node harness/scripts/screenshot.mjs --customer <customer> --url <homepage url>` (Playwright; the script says how to install it once). Look at the PNG: if it shows an error page, cookie banner or an empty hero, fix the cause and re-take it.
3. `node harness/scripts/sites-api.mjs upload-thumbnail --customer <customer> --file industry-verticals/<customer>/docs/ai/demos/<customer>/thumbnail.png` (dry run), then add `--apply`. It stores the result in `site.json`.
If Playwright or the URL is not available, list "set site thumbnail" under the manual tasks instead of blocking.

## Output
- `pages[]` in `demo-progress.yaml` all `verified` (or the failures listed)
- `variant-checklist.md` (per page)
- Manual-task list: variants, Home leftovers, navigation if needed
- Page URL list for `demo-script.md`: `<site hostname>/<path>` for each planned page

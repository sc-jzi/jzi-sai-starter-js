# Skill: Create and assemble ALL planned pages (replaces "Home only" Phase 6)

Called by `sitecore-demo-from-transcript` (Phase T5) after the NEW site is created and bootstrapped, and theme, images and content items exist. Input: the approved
`industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml` (`site.pages`) and `content-map.yaml`.
Use the Marketer MCP tools. Limits: `industry-verticals/prospera/docs/ai/reference/agent-api-limitations.md` (read-only reference; no variants via API, no context-only components, no component removal).

## Rules
1. Before every MCP write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<item path>"`. Stop on ❌. Pages are only ever created under `/sitecore/content/<collection>/<site>/Home` of THIS demo's site.
2. **Existing components are reused as they are on the Sitecore side.** Use rendering ids from the manifest (`docs/ai/manifests/sitecore-manifest.yaml`, shared layer only). Site-level ids (Home, Data folders, variants) come from `site-manifest.json`, never from the manifest's `main-website` entries. Never create or edit renderings, templates or datasource templates for a component whose manifest status is `complete`. Only NEW components (no manifest entry) are registered under /sitecore/layout, via their create-* skills.
3. Resume-safe: before creating anything, look it up (`get_content_item_by_path`). Record every id in `demo-progress.yaml` → `pages[]`.
4. Parents before children, in `site.pages` order.

## Steps
**1. Resolve the site.** `get_content_item_by_path("/sitecore/content/<collection>/<site>/Home")` → `homeId`. Read the Home page's template id with `get_content_item_by_id(homeId)`; that is the template for sub-pages of type `page` (confirm against `catalog/page-template-registry.yaml` for `article` / `landing`).

**2. Create the first sub-page only, then check it.** Create the first non-Home page:
`create_page(name=<last path segment>, parentId=<parent page id>, templateId=<page template id>)`.
Set its page fields (`Title` and the SEO fields listed under `inheritedFieldsUsed` in the registry) with `update_fields_on_content_item`, using field names from `get_content_item_by_id`.
Ask the SE to open it in Pages and confirm the header and footer render (this also confirms the manual header/footer step from bootstrap) and the site navigation looks right. (One short question; this proves the Page Design is inherited before N pages are created.) If header/footer are missing: stop and report; do not try to add context-only components by API.

**3. Create the remaining pages** the same way, parents first. Update progress after each.

**4. Components per page.** For each page, for each section top to bottom (`sections[]`):
- `add_component_on_page(pageId, componentRenderingId=<manifest rendering id>, placeholderPath="headless-main", componentItemName=<ComponentName>, insertAfterComponentId=<previous>)`.
- `set_component_datasource(pageId, componentId, datasourceId=<id from content-map.yaml for THIS page + section>)`.
- A new site's /Home starts with whatever the site template placed on it: re-wire what the plan keeps (match by component name and order), add the missing ones, and list leftovers that cannot be removed in the manual-cleanup list (API cannot remove components).
- New sub-pages start empty, so nothing needs cleaning.
- Header, footer and other context-only components are NOT added (they come from the Page Design set up in bootstrap step 4).

**5. Variants.** The API cannot set them. For every non-Default section on every page, add a row to `variant-checklist.md` grouped by page: page path, position, component, needed variant, variant id (from `site-manifest.json`). Estimated time = 15 s per row.

**6. Links and navigation.** Every CTA/nav link in the content must target a planned page path (`/<name>`). After creating pages, check: does the site's main navigation list the new pages? If navigation comes from a datasource or settings item (see `docs/ai/reference/sitecore-content-resolvers.md`), update it with `update_fields_on_content_item`; if it cannot be set by API, put one line in the manual-task list.

**7. Verify.** For each page: `get_components_on_page` → compare to the plan (component + order), check every datasource is non-empty, report gaps. Mark `pages[].status: verified`.

## Output
- `pages[]` in `demo-progress.yaml` all `verified` (or the failures listed)
- `variant-checklist.md` (per page)
- Manual-task list: variants, Home leftovers, navigation if needed
- Page URL list for `demo-script.md`: `<site hostname>/<path>` for each planned page

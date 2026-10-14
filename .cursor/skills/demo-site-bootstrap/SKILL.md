---
name: demo-site-bootstrap
description: Prepare a freshly created site: Data folders, Headless Variants, Available Renderings, header/footer partial designs, reusing shared components. Use right after demo-new-site and before building pages.
---

# Bootstrap a freshly created site so the shared components work in it

A site made from a site template has the standard presentation scaffolding but none of the project-specific items that ProsperaFinancial-style sites carry. The shared definitions (templates, renderings, rendering parameters under the project layer, `renderingsRoot` in `docs/ai/config/project.yaml`) already exist and are REUSED. This skill creates only what lives INSIDE the new site. Use the Marketer MCP; limits are in `.cursor/skills/sitecore-reference/references/agent-api-limitations.md`.

## Rules
- Run `node harness/scripts/bootstrap-plan.mjs <customer>` first; it lists exactly what is needed (`bootstrap-plan.md/json`).
- Before every write: `node harness/scripts/guard-customer.mjs sitecore-path <customer> "<path>"`.
- Use ids from the manifest ONLY for shared things (templates, folder templates, renderings, rendering parameters). Site-level ids in the manifest (any other site's `/sitecore/content/...` paths, variant definition ids, example items) belong to another site: never use or write them.
- Record every id you create or find in `industry-verticals/<customer>/docs/ai/demos/<customer>/site-manifest.json`; all later phases read site-level ids from there.
- Do not claim a write worked until you re-read it (several fields are silent-writes; see `sitecore-marketer-mcp-reference.md`).

## Step 0 — Probe (read-only)
With `get_content_item_by_path`, list and record in `site-probe.json`: `/sitecore/content/<coll>/<site>` children; `Home`; `Data`; `Presentation/{Available Renderings, Headless Variants, Partial Designs, Page Designs, Styles}`; `Settings`. Also confirm the shared layer exists (`renderingsRoot`, `projectTemplatesRoot` from `docs/ai/config/project.yaml`). If the shared layer is missing in this environment or collection, STOP and tell the SE: the components are not registered there and that is a separate (new-component) job.
If the probe shows there is no `Home` page (some site templates, e.g. Empty, may not create one), STOP and report what the probe found: do not guess a page template. The SE decides how to create Home once, then re-run.
The probe decides each step below: create only what is absent.

## Step 1 — Data root and datasource folders
If `Data` is missing, create it (use the folder template the probe shows other Data roots use; if none, ask the SE once). For each component with a datasource in `bootstrap-plan.json`: create `Data/<datasourceFolderName>` with `create_content_item`, template = `folderTemplateId`. Skip existing. The rendering's datasource location query looks under `$site/Data` for that folder template, so the template and the folder name must match the plan exactly.

## Step 2 — Headless Variants
For each component: ensure `Presentation/Headless Variants/<container>` exists (template **Headless Variants**), then one **Variant Definition** per variant needed (always `Default`), names exactly as the TSX exports (`industry-verticals/prospera/.cursor/skills/sitecore-add-variants/SKILL.md`). Record the variant ids in `site-manifest.json` (they feed the variant checklist).

## Step 3 — Available Renderings
Open `Presentation/Available Renderings/Page Content` (or the probe's equivalent). Its field cannot always be read through MCP. If you can read it: write the existing value + the plan's ids (concatenate, never replace). If you cannot read it, do NOT write: save the pipe-separated list from `bootstrap-plan.md` to `available-renderings.txt` and ask the SE to paste it after the existing value in Content Editor (one minute). The build cannot add components until this is done; ask once and wait.

## Step 4 — Derived page templates
Never point new pages at another site's templates directly. For each distinct page type in `demo-plan.yaml` (`page`, `article`, `landing`):
1. Base = the shared template from `industry-verticals/prospera/docs/ai/catalog/page-template-registry.yaml` (e.g. `/sitecore/templates/Project/Financial/Pages/Article Page`). Read-only.
2. Ensure the folder `/sitecore/templates/Project/<collection>/Pages` exists (Template Folder; create parents if absent; guard-check the path first).
3. Create the template there: `create_content_item` with the **Template** template (`{AB86861A-6030-46C5-B394-E8F99E8B87DB}`), name = the base template's name (`Article Page`, `Page`, ...). Set its **Base template** field (`__Base template`) to the base template id, then re-read to confirm. No own fields are needed; it inherits fields, standard values and insert options from the base.
4. Record `{pageType: derivedTemplateId}` in `site-manifest.json` → `pageTemplates`. `demo-build-pages` uses these ids, never the base ids.
If the write is refused, record the response in `harness/reference/marketer-mcp-tools.md` (limits), fall back to using the base template, and list it in the manual tasks.

## Step 5 — Header and footer partial designs, Page Designs
A partial design is an item in `Presentation/Partial Designs` that carries components, a page design is an item in `Presentation/Page Designs` that lists partials and is mapped to page templates. All are created by API; do not give up on them without trying.
1. **Learn the pattern (read-only)** from the site's own `Partial Designs` / `Page Designs` (the site template may already include some) or, if empty, from the reference site in `sitecore-manifest.yaml`: the template id of a partial design and of a page design, the field names (partial designs list, template mapping `Template To Design`), the header and footer placeholder paths (`get_components_on_page(pageId=<reference partial id>)`), and the encoding of the mapping value. Never write to the reference.
2. Create `Header` and `Footer` partial designs (same template as the reference). Then fill them. Rendering ids: the manifest, otherwise look the rendering up by name under `renderingsRoot`. Placeholder names come from the code (`industry-verticals/prospera/src/components/navigation/*.tsx`); nested ones are dynamic (`<name>-<DynamicPlaceholderId>-0` under the parent's placeholder): read the parent with `get_components_on_page` to get its exact path/dynamic id, build the child path from that, and re-read after every add.
   **Header partial design** — exactly this composition, in this order:
   | # | Component | Placeholder | Notes |
   |---|---|---|---|
   | 1 | `Eyebrow` | `headless-header` | MUST be first, i.e. above the Header component. No data source. |
   | 2 | `ThemeSwitcher` | Eyebrow's `eyebrow-left` | no data source |
   | 3 | `LanguageSwitcher` | Eyebrow's `eyebrow-right` | no data source |
   | 4 | `Header` | `headless-header`, after the Eyebrow (`insertAfterComponentId`) | variant **`WithLogoImage`** (see below); **data source = the Header data item below (REQUIRED, otherwise no logo renders)** |
   | 5 | `Navigation` | Header's `header-right` | data source = the site's Home item (or whatever the reference partial uses) |
   Note: with the `WithLogoImage` variant the Header renders the logo itself and only has `header-right`; the `Default` variant would use `header-left` instead.
   **Header data source (local data of the partial):** create under the Header partial design an item `Data` (same template the reference partials' `Data` child uses; probe it), and under it an item named `Header` based on the site's own Header component template (create it first, as below). Set its `LogoImage` field to the customer's logo: when `CH_ENABLED=true` use the public link of the uploaded Content Hub asset in the same image-field format the hero datasources use (`<image src="<public link>" dam-id=... />`); otherwise the downloaded logo URL/media item and add the logo to `images-to-upload.md`. Then **always** `set_component_datasource(pageId=<Header partial design id>, componentId=<the Header component id on it>, datasourceId=<that item id>)` and confirm with `get_components_on_page(<partial id>)` that the Header's datasource is non-empty and points at this item. A Header without that datasource is a failed step, not a finished one. The logo comes from the scraper/`download-images.mjs` (`logo` entry; if none was found, ask the SE for the logo URL once).
   **Header component template (own copy for the collection):** create `/sitecore/templates/Project/<collection>/Components/Header` as a derived template (Template folder `Components` first if missing; Base template = `{0DA7AA52-0C24-4721-9B6C-F6D8D9FAAAA0}`, i.e. `/sitecore/templates/Project/Financial/Components/Header`, so it inherits the `LogoImage` field). Re-read to confirm. Record the id in `site-manifest.json` → `componentTemplates.Header`.
   **Variant:** the Marketer MCP has no rendering-parameter or variant argument on `add_component_on_page` (see `harness/reference/marketer-mcp-tools.md`; `set_component_variant` configures personalization flows, not headless variants). Unless that file or a test shows otherwise, treat it as manual. Set `WithLogoImage` (the id from the site's `Headless Variants/Header` container, created in step 2 of this skill, so make sure the `Header` container has `Default` AND `WithLogoImage`) following the variant capability in `harness/reference/marketer-mcp-tools.md` (`FieldNames` rendering parameter). If the MCP cannot set it, put it first in the `variant-checklist.md` and the manual tasks marked "header: required, the logo does not show without it".
   **Footer partial design:** `SiteFooter` (rendering name in the manifest; data source = a footer item you create under the partial's `Data`, fields filled from the content plan).
   Rejected because the item is not a page? Try the variant the tool schema allows (see `harness/reference/marketer-mcp-tools.md`), once. If one component still fails, continue with the others, record the exact error in `agent-api-limitations.md` under "Partial designs", and add ONE manual task naming only what is missing (component, placeholder, data source).
3. Create Page Designs `Page` and `Article` (page design template from step 1) listing the `Header` and `Footer` partials (plus any body partial the reference uses), then set the **Template To Design** mapping on the Page Designs folder: derived `Page`/`Landing` templates → `Page` design, derived `Article` template → `Article` design. Append to an existing mapping value, never replace it. Re-read to confirm.
4. Verify later (demo-build-pages step 2): the first sub-page renders header and footer. A partial-design failure never blocks the build; the SE adds the two components by hand and the rest continues.

## Step 6 — Verify and hand on
Re-read every created item (`get_content_item_by_path`), compare with the plan, list gaps. Header check: Eyebrow above Header; ThemeSwitcher and LanguageSwitcher inside the Eyebrow; Navigation inside the Header; Header datasource set to its data item with `LogoImage` filled. Write `site-manifest.json`: `{ siteRoot, dataRoot, dataFolders: {Component: id}, variants: {Component: {Variant: id}}, availableRenderingsItem, pageTemplates: {pageType: id}, partialDesigns: {Header, Footer}, pageDesigns: {Page, Article}, home }`. Run the guard `check`. Then continue with content (Phase 3) and `sitecore-build-pages`.
If any step fails twice, stop and report what exists, what is missing, and which manual step unblocks it.

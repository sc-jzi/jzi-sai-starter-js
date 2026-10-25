---
name: demo-build-content
description: Build a demo's theme, new components, images and content items for EVERY planned page (multi-page), between demo-site-bootstrap and demo-build-pages. Part of /new-demo (demo-from-transcript T5); replaces the single-homepage phases of sitecore-build-demo.
---

# Theme, new components, images and content for all pages

> Rules: `.skills/RULES.md` (R1–R24) is the one source and wins over anything below; this skill refers to rules by number.

Runs after `demo-site-bootstrap` and before `sitecore-create-demo-variants` / `demo-build-pages`, inside an approved run (R1: no questions,
R3: the run gate decides "done"). Input: the approved `demo-plan.yaml`, the captures (`sections*.json`, crops), `theme/theme.yaml`,
`site-manifest.json` (site ids, Data folders). Work in the order below; update `demo-progress.yaml` after each step.

## 1. Theme (the approved draft; nothing is scraped again)
1. Copy `theme/theme.yaml` to `industry-verticals/<customer>/docs/ai/themes/<customer>.theme.yaml`.
2. Add its `siteThemeScss` block to `src/assets/sass/abstracts/vars/_colors.scss` as `body.site-<customer>, .site-<customer> { ... }` plus the
   `.dark` variant (variables: `.skills/sitecore-reference/references/site-theme-variables.md`).
3. Add `<SitecoreSiteName>: 'site-<customer>'` to `SITE_THEME_CLASS_MAP` in `src/lib/site-theme.ts` (site name from `site.json`).
4. Fonts: check `src/assets/basic/_fonts.scss` and `src/assets/sass/base/fonts/_fonts.scss` first; a Google Font gets its `<link>` in
   `src/app/layout.tsx`; a substitution for a licensed font goes under "Assumptions".
5. `node harness/scripts/build-check.mjs <customer> --quick` (R17). Record `themeDelivery: "site-theme-scss"` in `demo-progress.yaml`.

## 2. New components (`fit: new`)
Everything `demo-plan.yaml` specifies with `fit: new` / `new:` (body sections, and `site.chrome` entries with `delivery: new`; the list is
`bootstrap-plan.json` → `newComponents`). Build each in the customer's app only (R16), routed by `new.kind` with `sitecore-component-router`
(`simple` → `sitecore-create-simple-component`, `list` → `sitecore-create-list-component`, `context` → `sitecore-create-context-component`), from the
spec's `fields` / `children` / `behaviour`, open its section crop first (`component-crops.md`, R13), with the theme variables, a `Default` variant and
the client variant.
- `cms: true`: a real Sitecore component (template, rendering, datasource folder, Headless Variants container) registered in the customer's manifest
  copy and the component map (`npm run sitecore-tools:generate-map`). Sitecore items go in the shared project layer only for a NEW component (R22).
- `cms: false` (header area only): no datasource, its content is a config file in code; it still gets a rendering item so it can be placed.
- Afterwards: `node harness/scripts/bootstrap-plan.mjs <customer>`, then `demo-site-bootstrap` steps 2 and 3 for the new ones (container named like
  the rendering ITEM, Default + client variant, Available Renderings, Data folder when it has a datasource), `variants-verify.mjs --customer <customer> --fix`,
  and `build-check.mjs <customer>` (R17). Header-area components are placed in their partial design in `demo-build-pages` step 0.

## 3. Images (R8): collect → upload → (after placement) attach
1. `node harness/scripts/collect-images.mjs <customer>`: every image of every planned section on every mirrored page (and the footer), downloaded
   once, each manifest entry carrying its live URL and the page/section that uses it (`uses`). Re-running merges; nothing is uploaded twice.
2. Upload: `node harness/scripts/content-hub-upload.mjs <customer>` when `CH_ENABLED=true`, else `node harness/scripts/media-upload.mjs <customer>`
   (Media Library; files over 50 MB are listed under `## Missing assets` and the run carries on). Every entry ends with `uploadStatus: uploaded` and an
   `imageFieldXml`, or `too-large`. Exit 3 / failures: retry once, then fix the cause (download URL, size, format).
3. Attaching happens once the components are placed (`demo-build-pages` step 4): `attach-images.mjs <customer> --page <path>` proposes each Image
   field; write them with `update_fields_on_item` (R5). Content items written in step 4 below may already carry the `imageFieldXml` of their
   section's images (from `uses`).

## 4. Content items, page by page (R5, R6, R7, R8, R20)
Content comes from the prospect's live page for mirrored pages (R12), from the transcript or marked illustrative for story pages.
1. Full text per mirrored page: `node harness/scripts/content-extractor.mjs --url <the page's liveUrl> --output <demo folder>/extracted/<page-slug>`
   (one folder per page; never `--download-images`: images come from step 3). The section captures (`sections*.json`) give the order and the links.
2. Write `<demo folder>/content-map.yaml`, one entry per planned section of every page:
   ```yaml
   pages:
     - path: /Home/membership
       sections:
         - position: 1                      # as in demo-plan.yaml
           component: PromoCta              # rendering name
           liveSection: 2
           datasource: { name: "<Customer> Membership PromoCta", parent: "<site>/Data/<component folder>", id: "" }   # id filled after creation
           fields: { Title: "...", Text: "<p>...</p>", Link: "<link ... />", Image: "<image ... />" }
           children: []                     # list components: one map of fields per child item
   ```
   Field values are final Sitecore formats: link XML from `link-xml.mjs make` (R7), image XML from the manifest (R8), Rich Text as HTML, never a
   literal URL or path. A field the prospect's section does not show stays empty (no placeholder text, no second link).
3. Create each item through the Marketer MCP: `guard-customer.mjs sitecore-path` first (R21), `create_content_item` under the site's
   `Data/<component folder>` with the rendering's datasource template (R6), then `update_fields_on_item`, then read it back (R23). New items inherit
   the template's sample standard values: blank every field the map does not fill. List components: create the children under the item.
   Record each id in `content-map.yaml`.
4. `node harness/scripts/link-audit.mjs <customer>` exits 0 before any page is assembled.

Then `sitecore-create-demo-variants` (phase 5.5) and `demo-build-pages`.

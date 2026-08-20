# Agent API / Marketer MCP — Known Limitations

Documented limitations discovered during the SitecoreAI Demo Builder project. These affect automated page assembly and demo creation workflows.

---

## 1. Cannot set rendering parameters via `add_component_on_page`

**Date discovered:** 2026-04-09
**Severity:** High — blocks full page assembly automation
**Status:** Confirmed limitation, feature request recommended

### The Problem

The `add_component_on_page` MCP tool adds a component to a page and can set **datasource fields** via the `fields` parameter, but it **cannot set rendering parameters** — including the `FieldNames` parameter that controls which **Headless Variant** is used.

This means when the pipeline adds a component to a page, it always renders as Default variant. The SE must manually open Pages editor, select each component, go to Design tab, and pick the correct variant.

### What We Tested

| Attempt | `fields` payload | Result |
|---------|-----------------|--------|
| `{"FieldNames": "{variant-id}"}` | `Cannot find a field with the name FieldNames` (400) |
| `{"Variant": "{variant-id}"}` | `Cannot find a field with the name Variant` (400) |
| `{"Parameters": "FieldNames={id}"}` | `Cannot find a field with the name Parameters` (400) |
| `{"parameters": {"FieldNames": "{id}"}}` | `Cannot find a field with the name parameters` (400) |
| `{"_rendering_parameters": {"FieldNames": "{id}"}}` | `Cannot find a field with the name _rendering_parameters` (400) |
| `{"renderingParameters": "FieldNames={id}&..."}` | `Cannot find a field with the name renderingParameters` (400) |
| `{"nodes": [{"name": "Parameters", "value": "..."}]}` | `Cannot find a field with the name nodes` (400) |
| `{"fields": [{"name": "Parameters", "value": "..."}]}` | `Cannot find a field with the name fields` (400) |
| `[{"name": "Parameters", "value": "..."}]` | MCP schema error: `Expected object, received string` |
| `{}` (empty) | Works — component added, `FieldNames: null` (Default variant) |

The `fields` parameter validates every top-level key against the component's **datasource template fields** only. It rejects anything that isn't a datasource field name. There is no alternative parameter or payload format to pass rendering parameters.

### What Works

- `add_component_on_page` — adds component to placeholder (works)
- `set_component_datasource` — wires datasource item (works)
- `get_components_on_page` — reads component list including `FieldNames` (works, can see variant after manual change)
- `insertAfterComponentId` / `insertBeforeComponentId` — ordering (available, untested)

### What Doesn't Work

- Setting `FieldNames` (variant) at add time
- Setting `GridParameters` at add time
- Setting `Styles` at add time
- Setting `RenderingIdentifier` at add time
- Setting `CSSStyles` at add time
- Updating any rendering parameter after placement (no `update_component_parameters` tool exists)

### Verification

After manually changing a variant in Pages editor, `get_components_on_page` correctly returns the updated `FieldNames` value. This confirms:
- The data model supports per-component variant selection
- The read API surfaces it correctly
- Only the **write path** is missing

---

## Why This Matters — Feature Request Justification

### Business Impact

**Audience:** Solution Engineers building customer demos

The SitecoreAI Demo Builder automates demo creation from a client's homepage URL. The pipeline:
1. Extracts the client's brand theme (colors, fonts, spacing)
2. Analyzes the homepage and matches each section to a template component + variant
3. Populates datasource items with the client's actual content
4. Applies the theme via CSS variables
5. **Assembles the page** by adding components in the correct order

Steps 1-4 are fully automated. Step 5 can add components and wire datasources via MCP, but **cannot select the correct variant** for each component. This forces the SE to manually set variants on 10-15 components per page — approximately 2-3 minutes of repetitive clicking in Pages editor.

### The Ask

Add an optional `renderingParameters` (or `parameters`) argument to `add_component_on_page` that accepts a key-value map of rendering parameter values:

```json
{
  "pageId": "...",
  "componentRenderingId": "...",
  "placeholderPath": "headless-main",
  "componentItemName": "HeroBanner",
  "fields": { "Title": "Welcome" },
  "renderingParameters": {
    "FieldNames": "{variant-definition-id}",
    "GridParameters": "{grid-id}",
    "Styles": "",
    "RenderingIdentifier": ""
  }
}
```

Alternatively, a separate `update_component_parameters` tool that accepts a page ID + component instance ID + parameters map would also solve this.

### Scale of Impact

- **18 template components** in the demo library, each with 2-5 variants
- **Every demo page** requires variant selection for most components
- **Multi-page demos** (homepage + 2-3 subpages) multiply the manual work
- **Every SE in the organization** hits this limitation on every demo build

### Without This Feature

| Step | Automated? | Time |
|------|-----------|------|
| Theme extraction | Yes | ~30 sec |
| Homepage analysis | Yes | ~1 min |
| Content population | Yes | ~2 min |
| Theme application | Yes | ~10 sec |
| Page assembly (add + datasource) | Yes | ~1 min |
| **Variant selection** | **No — manual** | **~3 min per page** |

For a 3-page demo, variant selection adds ~10 minutes of manual work to an otherwise fully automated pipeline that runs in under 5 minutes.

### With This Feature

The entire pipeline becomes end-to-end automated. The build plan already contains the variant selection for every component (determined by visual analysis of the client's homepage). The pipeline just needs to pass the variant ID when adding each component.

```yaml
# From the build plan — variant already determined
sections:
  - position: 3
    matchedComponent:
      registryId: "hero-banner"
      variant: "Default"           # ← pipeline knows this
      matchConfidence: "high"
    variantReason: "Dark background, centered text — Default variant"
```

The only missing link is passing `FieldNames={variant-id}` to the API.

---

## 2. Cannot add context-only components via `add_component_on_page`

**Date discovered:** 2026-04-11
**Severity:** Medium — blocks automated placement of NavigationHeader and SiteFooter
**Status:** Confirmed limitation

### The Problem

`add_component_on_page` requires the rendering to have a `Datasource Template` configured. For context-only components (renderings with no datasource template, like NavigationHeader and SiteFooter), the API returns:

```
"No datasource template found for component"
```

This means context-only components cannot be added to pages via the API.

### Affected Components

Any rendering where `Datasource Template` is empty:
- **NavigationHeader** — reads from navigation content resolver
- **SiteFooter** — reads from site settings / hardcoded data

### Workaround

1. Flag these components in the build plan as `apiAddable: false`
2. Skip them during automated page assembly
3. Add them to the manual tasks checklist with clear positioning:
   ```
   - Add NavigationHeader in Pages editor (position: between AnnouncementBar and HeroBanner)
   - Add SiteFooter in Pages editor (position: last component on the page)
   ```
4. If the components live in a Partial Design (header/footer partials), they may already be on the page — check first

### Impact on Demo Build

For a typical 10-section demo page, 2 components (header + footer) must be added manually. This takes ~30 seconds in Pages editor.

---

## 3. Cannot remove components from a page via MCP

**Date discovered:** 2026-04-09
**Severity:** Medium — affects page cleanup and reset workflows
**Status:** No `remove_component_from_page` tool found in MCP
**Previously numbered:** #2

### The Problem

There is no MCP tool to remove a component from a page. This means:
- Old OOB starter kit components (RichText, Image, Container, Promo) cannot be cleaned up programmatically
- The "reset and rebuild" page assembly approach requires manual component deletion
- Demo page refresh (swapping one client's components for another) needs manual cleanup

### Workaround

Create a new empty page instead of reusing an existing one. Components are only added, never removed, via the pipeline.

---

## 4. `add_component_on_page` auto-creates local datasource

**Date discovered:** 2026-04-09
**Severity:** Low — informational
**Status:** Expected behavior, but needs awareness

### The Behavior

When `add_component_on_page` is called, it automatically creates a **local datasource item** under the page's Data folder (e.g., `local:/Data/RichTextBlock`). This happens even if you intend to wire a shared datasource via `set_component_datasource`.

### Implication

After adding a component and setting a shared datasource, the auto-created local datasource item becomes orphaned. Over time, pages accumulate unused local datasource items. Not a breaking issue, but creates content clutter.

---

## 5. Image upload — fully automated via Content Hub Upload API

**Date discovered:** 2026-04-29
**Severity:** Resolved — images are now fully automated
**Status:** Tested and proven on Content Hub sandbox

### Background

Early versions stated "No `upload_asset` MCP tool exists." While the XM Cloud Marketer MCP still doesn't expose `upload_asset` as a tool, the **Content Hub Upload API v2** is available and fully supports automated image upload, approval, and public link creation.

### Solution: Content Hub Upload API v2

Script: `docs/ai/scripts/upload-to-content-hub.mjs`

**5 steps per image (all automated):**
1. `POST /api/v2.0/upload` — request upload URL
2. `POST /api/v2.0/upload/process` — upload file binary
3. `POST /api/v2.0/upload/finalize` — get `asset_id` + `asset_identifier`
4. `POST /api/entities/{id}/lifecycle/approve` — auto-approve (Created → Approved)
5. `POST /api/entities` (M.PublicLink) — create public link for working public URL

**Auth:** Simple auth (`POST /api/authenticate` with username/password) or OAuth password grant. Credentials stored in `docs/ai/config/credentials.local.yaml` (gitignored).

### Image field format (DAM)

XM Cloud datasource Image fields use the Content Hub DAM format:
```xml
<Image src="https://<CH_HOST>/api/public/content/<relativeUrl>?v=<hash>"
       dam-id="<assetIdentifier>"
       alt="Description"
       dam-content-type="Image"
       thumbnailsrc="https://<CH_HOST>/api/gateway/<assetId>/thumbnail" />
```

The upload script writes `imageFieldXml` to `image-manifest.json` — use directly with `update_fields_on_content_item`.

### Pipeline integration

Phase 2.5: `content-extractor.mjs --download-images` downloads all section images locally
Phase 3 Step 1: `upload-to-content-hub.mjs` uploads + approves + creates public links with `{assetId}-{name}` URL format
Phase 3 Step 3: Agent reads `imageFieldXml` from manifest, includes Image fields in same `update_fields_on_content_item` call as text + link fields

### MCP asset tools (for search/verify only)

- `search_assets` — search for assets by name (not for upload)
- `get_asset_information` — get asset details by UUID (XM Cloud Media Library only, not Content Hub)
- `update_asset` — update alt text and metadata

---

## 6. Site name is derived from the display name, not the item name

**Date discovered:** 2026-08-20
**Severity:** High — breaks all layout operations for affected sites
**Status:** Confirmed; fixable by aligning the display name

### The Problem

The Agent API builds the `sc_site` query string parameter from the site's **display name** rather than the site item name. When the two differ by more than case, Sitecore cannot resolve the site and every layout request fails with a bare HTTP 500. The CM log shows:

```
System.InvalidOperationException: Site from query string was not found: Kal Tire
   at Sitecore.Sites.SiteContextResolver.ResolveSiteContext(...)
   at Sitecore.Pipelines.PreAuthenticateRequest.SiteResolver.Process(HttpRequestArgs args)
```

Most sites never hit this because Sitecore matches site names case-insensitively, so a display name of `Quanex` still resolves to the site `quanex`. A display name of `Kal Tire` cannot resolve to `kal-tire`, because a space is not a hyphen.

### The Fix

Set `__Display name` on the **site root item** (the Headless Site item, e.g. `/sitecore/content/retail/kal-tire`) to a value that differs from the site name by case only. Setting it on the Site Grouping site item has no effect.

### Detection

Call `get_page_preview_url` and inspect the `sc_site` parameter. If it does not match the site name modulo case, layout operations will fail.

---

## 7. All writes to pre-existing pages return HTTP 500

**Date discovered:** 2026-08-20
**Severity:** High — blocks automated page assembly entirely
**Status:** Unresolved; no server-side exception logged

### The Problem

On an XM Cloud environment where site resolution is correct (see §6), reads of a **pre-existing** page succeed but writes to that page fail. The same write tools succeed on a page created in the same site via `create_page`. Datasource-item writes succeed in both cases.

| Operation | Pre-existing page (Home, `/personal`) | New page (`create_page`) |
|-----------|----------------------------------------|--------------------------|
| `get_components_on_page` | works | works |
| `get_allowed_comps_by_ph` | works | works |
| `update_fields_on_item` on a **datasource** item | works | works |
| `update_fields_on_item` on a **page** item | 500 | works |
| `set_component_datasource` | 500 | works |
| `add_component_on_page` | 500 | works |

The three operations that fail on Home (`update_fields_on_item` against the page, `set_component_datasource`, `add_component_on_page`) all succeeded on the fresh page. That narrows the fault to pre-existing pages, not the site, the tools, or the renderings.

Sitecore CM logs record **no exception** for the failing attempts — only `[OrcaBearerAuthentication] No configuration manager found for issuer 'https://auth.sitecorecloud.io'`, which also appears during calls that succeed and is therefore not the cause.

### Implication

Because the 500 surfaces no server-side detail, there is nothing actionable to diagnose from logs. Treat Phase 6 as manual for affected environments and generate a manual task checklist instead.

### Side effect

`add_component_on_page` creates its local datasource item *before* the write fails. A retry then errors with `a content item with the same name is already defined on this level`. Delete the orphan under the page's `Data` folder before retrying.

- Agent API docs: https://api-docs.sitecore.com/ai-capabilities/agent-api
- Asset API docs: https://api-docs.sitecore.com/sai/agent-api/assets
- Content Hub Upload API: https://doc.sitecore.com/ch/en/developers/cloud-dev/upload.html
- Marketer MCP tools reference: https://doc.sitecore.com/sai/en/users/sitecoreai/marketer-mcp-tools-reference.html
- Pages API (UpdateFields): `PATCH /api/v1/pages/{pageId}` — page fields only, not component parameters
- Test evidence: `docs/ai/demos/home-page-components.json` — Home page component dump showing FieldNames values

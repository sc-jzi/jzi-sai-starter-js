---
name: sitecore-create-simple-component
description: Use this skill when creating a Sitecore XM Cloud component backed by a single datasource item.
---

# Sitecore create simple component

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, ask first. Shared reference docs live in `.skills/sitecore-reference/references/`.

Use this skill when creating a Sitecore XM Cloud component backed by a **single datasource item**.

## Trigger hints
Use this skill when the component:
- uses a single datasource item
- is a hero, promo, CTA, content block, image/text block, or quote block
- should be reusable by selecting a datasource item
- does not have repeated child datasource content

## Do not use this skill when
- the component needs repeated child items
- authors must create nested cards/rows/FAQ items/testimonials
- the rendering depends on `ComponentQuery`
- the component requires authorable collections of child datasource items

Use instead:
- `.skills/sitecore-create-list-component/SKILL.md`
- `.skills/sitecore-create-context-component/SKILL.md`

---

## Load first
- `.skills/sitecore-reference/references/sitecore-rules.md`
- `.skills/sitecore-reference/references/react-component-guidelines.md`
- `docs/ai/templates/sitecore-component-spec.template.yaml`
- `harness/reference/marketer-mcp-tools.md`
- `.skills/sitecore-maintain-manifest/SKILL.md`

## Examples
- `.skills/sitecore-create-simple-component/examples/hero.request.md`
- `.skills/sitecore-create-simple-component/examples/hero.spec.yaml`
- `.skills/sitecore-create-simple-component/examples/promo-banner.spec.yaml`

---

## Inputs to collect

Confirm or infer:
- component name
- category/grouping
- site collection and site name
- rendering name
- datasource template name
- folder template name
- React file path
- field names and field types
- screenshot/design reference if provided
- whether datasource is required
- whether repo process expects direct MCP item creation or serialization

If required information is missing, ask concise follow-up questions first.

---

## Required workflow

1. Classify the request as a simple datasource component.
2. Inspect screenshots/design references before implementation.
3. Normalize into `docs/ai/templates/sitecore-component-spec.template.yaml`.
4. Apply safe defaults (see below).
5. Read `docs/ai/manifests/sitecore-manifest.yaml`.
   - If the component exists with `status: complete`, confirm with user before re-creating.
   - If `status: partial` or `failed`, resume using recorded item IDs.
   - If not found, register a `planned` entry.
6. State assumptions clearly.
7. Before implementation, return:
   - chosen workflow
   - classification
   - assumptions
   - completed or partial spec
   - plan
8. Then implement.

If the user wants approval first, stop after the plan.

## Safe defaults
If not explicitly specified:

- `component.kind = simple`
- `component.filePath = src/components/pagecontent/<ComponentNamePascal>.tsx`
- `rendering.datasourceRequired = true`
- `rendering.useComponentQuery = false`
- `rendering.componentQuery = ""`
- `react.propsShape = default-jss`

---

## Sitecore implementation rules

### Marketer MCP first

R5 (`.skills/RULES.md`) and `harness/reference/marketer-mcp-tools.md`: every item this skill creates (templates, sections, fields, Standard Values, folders, renderings) goes through the Marketer MCP; fall back to other output only after an observed failure.

### Creation order

0. Check `docs/ai/manifests/sitecore-manifest.yaml` → `lookups` for cached parent item IDs. Use cached IDs for structural paths instead of resolving via MCP. If lookups are empty (first task), resolve all 6 required structural paths and populate lookups before proceeding.
1. resolve or create the folder/container structure:
   - resolve `projectTemplatesRoot/Components` via `get_content_item_by_path`. If it does not exist, create it using template folder ID `0437fee2-44c9-46a6-abe9-28858d9fee8c`.
   - resolve or create the `<Category>` subfolder under `Components` (same template folder ID).
   - do the same for `renderingsRoot/<Category>` and `renderingParamsRoot/<Category>`.
   - resolve or create `projectFoldersRoot` (the `Folders` container under `projectTemplatesRoot`).
   - **⚠️ IMPORTANT: If creating NEW category folders, create ALL 3 category folders FIRST in their own batch and wait for IDs. Only create templates in the NEXT batch. Creating templates in the same batch as their category folders risks placing them under the wrong parent (race condition).**
2. create datasource template
3. set `__Base template` on datasource template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). This applies to all datasource templates, **not** folder templates.
4. create template section
5. create template fields
6. explicitly set each field item `Type`
7. create template `__Standard Values`
8. link the datasource template to its `__Standard Values` — set the `Standard values` field on the template item to the `__Standard Values` Item ID
9. create folder template
10. create folder template `__Standard Values`
11. link the folder template to its `__Standard Values` — same as step 8
12. set folder insert options / `__Masters`
13. create datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data`
14. set insert options on the datasource folder item itself (not only on the folder template `__Standard Values`)
15. create an example datasource item inside the folder (using the datasource template)
16. create Rendering Parameters template under `renderingParamsRoot/<Category>/<ComponentName>`
17. set all four base templates on the Rendering Parameters template
18. create rendering item
19. update rendering fields via MCP. Use these known MCP field names:
    - `componentName` = PascalCase component name matching TSX filename (e.g. `EurobankHeader`)
    - `Parameters Template` = Item ID (GUID) of the Rendering Parameters template
    - `AddFieldEditorButton` = `1`
    - `Datasource Template` = full Sitecore path to the datasource template (silent-write — `updatedFields` will be empty, this is normal)
    - `Datasource Location` = dynamic query (silent-write). Use the standard pattern: `query:$site/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']`
18. register the rendering in Available Renderings — **read the current value** of the `Renderings` field on the **Page Content** Available Renderings item, then **concatenate** (not replace) the new rendering ID with a pipe separator. Path: at `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`
19. verify final state

### Batch operations cheat sheet (simple component)

Optimize MCP calls by batching independent operations. This is the proven sequence from 10+ components:

```
Batch 1 (if new category): Create 3 category folders (Components, Rendering Parameters, Renderings)
   ↓ wait for IDs
Batch 2: Create datasource template + folder template
Batch 3: Set base templates + create Data section
Batch 4: Create all fields (parallel)
Batch 5: Set all field types (parallel), then read every Type back: none may be empty (R26) — stop here until they are
Batch 6: Create both __Standard Values (parallel)
Batch 7: Link SVs + set defaults + set __Masters + create datasource folder + rendering params + rendering (all parallel)
Batch 8: Set folder insert options + rendering params base templates + rendering fields + create example item + create variants container (all parallel)
Batch 9: Create all variant definitions (parallel)
Batch 10: Ask user for Available Renderings value → append
```

---

### Parent resolution

Resolve parents, never guess ids: `harness/reference/marketer-mcp-tools.md` → "Usage patterns and known behaviour".

### Template field rule

Every field gets an explicit `Type`, read back after it is set: `sitecore-rules.md` → Template fields (and R26 in `.skills/RULES.md`).

### `__Standard Values` rule

- `name = "__Standard Values"`, `parentId = owning template ID`, `templateId = owning template ID`
- After creation, **link it**: set `__Standard values` on the template item to the SV's Item ID (silent-write — empty `updatedFields` is normal)
- Applies to datasource templates and folder templates
- Do NOT use Standard template ID `1930bbeb-...` as the templateId

---

### Folder template rule

When creating a datasource folder template:
- create the folder template item
- create its `__Standard Values` using the folder template's own item ID as both `parentId` and `templateId`
- set insert options / `__Masters` so authors can create the correct datasource items inside the folder

Use exact field names returned by MCP inspection when updating insert options.

---

### Rendering rule

Prefer **JSON Rendering** unless repo convention differs.

For simple datasource components:
- datasource should normally be required
- `ComponentQuery` must remain empty
- `AddFieldEditorButton = 1` is preferred
- `Datasource Template` must use a full Sitecore path
- `Component Name [shared]` must be **PascalCase** and **exactly match** the TSX filename without extension (e.g. `EurobankHeader` for `EurobankHeader.tsx`)
- `Parameters Template [shared]` must be set to the **Item ID (GUID)** of the Rendering Parameters template — **never use a path**. Resolve the ID via MCP after creating the Rendering Parameters template.

Use exact field names returned by MCP inspection when updating the item.

---


### Example datasource item rule

`sitecore-rules.md` → Example datasource items: one item from the datasource template, named after the component.

### Datasource template base templates rule

`sitecore-rules.md` → Base Templates (datasource templates): set right after creating the datasource template, before its sections and fields.

### Insert options on datasource folder instance rule

`sitecore-rules.md` → Insert Options: `__Masters` = the datasource template on the folder template's Standard Values AND on the datasource folder item itself.

### Available Renderings rule

`sitecore-rules.md` → Available Renderings: append the new rendering id to `Renderings`, never replace the value.

### Verification rule

Prefer MCP-based verification first. Verify:
- template path and section
- datasource template `Base template` includes `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
- field existence and `Type`
- template `__Standard Values` is based on owning template
- folder template `__Standard Values` is based on owning folder template
- folder insert options / `__Masters`
- datasource folder path
- insert options set on datasource folder instance (not only on folder template)
- rendering datasource template, datasource location, component name
- `Component Name [shared]` is PascalCase matching TSX filename
- `Parameters Template [shared]` is set to the Item ID (GUID), not a path
- rendering is registered in Available Renderings (Page Content)

If something cannot be reliably verified through MCP, state that explicitly and mark it as follow-up required.

---

## React implementation rules

- Create under `src/components/pagecontent/<ComponentNamePascal>.tsx`
- Component props type **must** extend `ComponentProps` from `lib/component-props` — never define `params` manually
- Always use `params.styles` and `params.RenderingIdentifier` from `ComponentProps` in the wrapper element
- Match the neighbouring components in the same folder: Bootstrap layout, Sass partial under `src/assets/sass/components/`, site theme variables for colors.
- Always import from `@sitecore-content-sdk/nextjs`
- Use top-level field access: `fields.Title`, `fields.Description`, `fields.PrimaryLink`, `fields.HeroImage`
- **All** Sitecore-managed fields must use SDK editable helpers (`Text`, `RichText`, `NextImage as ContentSdkImage`, `Link as ContentSdkLink`) — never use plain `<img>`, `<a>`, or hardcoded text for authorable fields
- Do not model repeated child items in this workflow



### Rendering Parameters template rule

`sitecore-rules.md` → Rendering Parameters templates: create it before the rendering, all four base templates, and set the rendering's `Parameters Template [shared]` to its item id.

### Named exports and variants rule

`sitecore-rules.md` → Named Exports (further variants: `.skills/sitecore-add-variants/SKILL.md`).

### Component map rule

`sitecore-rules.md` → Component map: the maps are generated (`npm run sitecore-tools:generate-map`); never edit them by hand.

## Output format

Before implementation:
1. chosen workflow
2. classification
3. assumptions
4. completed or partial spec
5. plan

After implementation:
1. Sitecore actions performed
2. MCP/item operations performed
3. files changed
4. verification results
5. follow-up verification or serialization requirements
6. updated manifest entry

---

## Completion rule

A task is only fully complete when:
- the React component is implemented
- the component map is updated when required
- the needed Sitecore items were created/updated or clearly reported as blocked
- the important Sitecore values were verified or explicitly flagged for follow-up

Do not silently downgrade unverified Sitecore work to "manual setup required" without explaining why.

---

## Verification checklist

**Simple-component-specific:**
- [ ] Request correctly classified as simple component
- [ ] Datasource template created with base templates `{1930BBEB-...}|{44A022DB-...}`
- [ ] Template section + fields created with explicit `Type`
- [ ] `__Standard Values` created and linked to template
- [ ] Folder template + SV created, `__Masters` → datasource template
- [ ] Datasource folder under `/Data` with insert options on instance
- [ ] Example datasource item created inside folder
- [ ] `Datasource Template` uses full Sitecore path
- [ ] `Datasource Location` is valid
- [ ] `ComponentQuery` is empty
- [ ] TSX uses top-level `fields.<FieldName>`

**Shared checks** — see `.skills/sitecore-reference/references/verification-checklist.md`

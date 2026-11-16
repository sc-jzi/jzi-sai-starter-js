---
name: sitecore-create-list-component
description: Use this skill when creating a Sitecore XM Cloud component with a parent datasource item containing authorable child items, where the rendering requires ComponentQuery.
---

# Sitecore create list component

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, ask first. Shared reference docs live in `.skills/sitecore-reference/references/`.

Use this skill when creating a Sitecore XM Cloud component with a **parent datasource item** containing **authorable child items**, where the rendering requires `ComponentQuery`.

## Trigger hints
Use this skill when the component:
- has repeated authorable items
- needs parent + child datasource structure
- is a card grid, FAQ, accordion, tabs, slider, testimonial list, or similar
- should be author-managed from datasource children

## Do not use this skill when
- the component only needs one datasource item with no child items
- the rendering should not use `ComponentQuery`
- the component should render from route/page context only

Use instead:
- `.skills/sitecore-create-simple-component/SKILL.md`
- `.skills/sitecore-create-context-component/SKILL.md`

---

## Load first
- `.skills/sitecore-reference/references/sitecore-rules.md`
- `.skills/sitecore-reference/references/react-component-guidelines.md`
- `docs/ai/templates/sitecore-component-spec.template.yaml`
- `harness/reference/marketer-mcp-tools.md`
- `.skills/sitecore-maintain-manifest/SKILL.md`

## Examples
- `.skills/sitecore-create-list-component/examples/article-cards.request.md`
- `.skills/sitecore-create-list-component/examples/article-cards.spec.yaml`

---

## Inputs to collect

- `siteCollection`
- `siteName`
- `category`
- parent template name and field list
- child template name and field list
- optional screenshot paths or attached screenshots

---

## Required workflow

1. Read the request.
2. If screenshots are provided, inspect them first.
3. Confirm the request is a **list / parent-child datasource** component.
4. Normalize into `docs/ai/templates/sitecore-component-spec.template.yaml`.
5. Apply safe defaults (see below).
6. Read `docs/ai/manifests/sitecore-manifest.yaml`.
   - If the component exists with `status: complete`, confirm with user before re-creating.
   - If `status: partial` or `failed`, resume using recorded item IDs.
   - If not found, register a `planned` entry.
7. Ask concise follow-up questions if required values are missing.
8. Before implementation, show:
   - chosen classification
   - inferred layout
   - inferred parent and child field models
   - assumptions
   - completed or partial spec
   - plan
9. Then implement.

If the user asks for an approval gate, stop after the plan and wait.

## Safe defaults
If not explicitly specified:

- `component.kind = list`
- `component.filePath = src/components/pagecontent/<ComponentNamePascal>.tsx`
- `rendering.datasourceRequired = true`
- `rendering.useComponentQuery = true`
- `react.propsShape = graphql-datasource`
- `templates.parent.standardValues.addHorizonDatasourceGrouping = true`
- `folderTemplate.name = <Component Name> Folder`
- `datasourceFolder.name = <Component Name>`

---

## Sitecore implementation rules

R5 (`.skills/RULES.md`) and `harness/reference/marketer-mcp-tools.md`: every item this skill creates goes through the Marketer MCP; fall back to other output only after an observed failure.

### Creation order

0. Check `docs/ai/manifests/sitecore-manifest.yaml` → `lookups` for cached parent item IDs. Use cached IDs for structural paths instead of resolving via MCP. If lookups are empty (first task), resolve all 6 required structural paths and populate lookups before proceeding.
1. resolve or create parent container structure:
   - resolve `projectTemplatesRoot/Components` via `get_content_item_by_path`. If it does not exist, create it using template folder ID `0437fee2-44c9-46a6-abe9-28858d9fee8c`.
   - resolve or create the `<Category>` subfolder under `Components` (same template folder ID).
   - do the same for `renderingsRoot/<Category>` and `renderingParamsRoot/<Category>`.
   - **⚠️ IMPORTANT: If creating NEW category folders, create ALL 3 category folders FIRST in their own batch and wait for IDs. Only create templates in the NEXT batch. Creating templates in the same batch as their category folders risks placing them under the wrong parent (race condition).**
2. parent template
3. set `__Base template` on parent template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}` (Standard Template + Grid Parameters). This applies to all datasource templates, **not** folder templates.
4. parent `Data` section
5. parent field items — explicitly set each field `Type`
6. parent `__Standard Values`
7. link parent template to its `__Standard Values` — set the `Standard values` field on the parent template item to the `__Standard Values` Item ID
8. child template
9. set `__Base template` on child template to `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
10. child `Data` section
11. child field items — explicitly set each field `Type`
12. child `__Standard Values`
13. link child template to its `__Standard Values` — same as step 7
14. folder template
15. folder template `__Standard Values`
16. link folder template to its `__Standard Values` — same as step 7
17. set folder insert options / `__Masters` to parent template
15. datasource folder under `/sitecore/content/<siteCollection>/<siteName>/Data/`
16. set insert options on the datasource folder item itself (not only on the folder template `__Standard Values`)
17. create an example parent datasource item inside the folder (using the parent template)
18. create one or two example child items inside the parent item (using the child template)
19. create Rendering Parameters template under `renderingParamsRoot/<Category>/<ComponentName>`
20. set all four base templates on the Rendering Parameters template
21. rendering item
22. update rendering fields via MCP. Use these known MCP field names:
    - `componentName` = PascalCase component name matching TSX filename
    - `Parameters Template` = Item ID (GUID) of the Rendering Parameters template
    - `AddFieldEditorButton` = `1`
    - `ComponentQuery` = the GraphQL query
    - `Datasource Template` = full Sitecore path to the parent datasource template (silent-write — `updatedFields` will be empty, this is normal)
    - `Datasource Location` = dynamic query (silent-write). Use the standard pattern: `query:$site/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']|query:$sharedSites/*[@@name='Data']/*[@@templatename='<FolderTemplateName>']`
23. register the rendering in Available Renderings
24. register the rendering in Available Renderings — **read the current value** of the `Renderings` field on the **Page Content** Available Renderings item, then **concatenate** (not replace) the new rendering ID with a pipe separator. Path: at `/sitecore/content/<siteCollection>/<siteName>/Presentation/Available Renderings/Page Content`
25. verify final state

### Batch operations cheat sheet (list component)

Optimize MCP calls by batching independent operations. This is the proven sequence from 8+ list components:

```
Batch 1 (if new category): Create 3 category folders (Components, Rendering Parameters, Renderings)
   ↓ wait for IDs
Batch 2: Create parent template + child template + folder template (parallel)
Batch 3: Set base templates on both datasource templates + create both Data sections (parallel)
Batch 4: Create all fields — parent + child (parallel)
Batch 5: Set all field types (parallel), then read every Type back: none may be empty (R26) — stop here until they are
Batch 6: Create all 3 __Standard Values (parallel)
Batch 7: Link all SVs + set defaults + set __Masters + create datasource folder + rendering params + rendering (all parallel)
Batch 8: Set folder insert options + rendering params base templates + rendering fields + create example parent + create variants container (all parallel)
Batch 9: Create example children + all variant definitions (parallel)
Batch 10: Ask user for Available Renderings value → append
```

### Parent resolution

Resolve parents, never guess ids: `harness/reference/marketer-mcp-tools.md` → "Usage patterns and known behaviour".

### Template field rule

Every field gets an explicit `Type`, read back after it is set: `sitecore-rules.md` → Template fields (and R26 in `.skills/RULES.md`).

### `__Standard Values` rule

- `name = "__Standard Values"`, `parentId = owning template ID`, `templateId = owning template ID`
- After creation, **link it**: set `__Standard values` on the template item to the SV's Item ID (silent-write — empty `updatedFields` is normal)
- Applies to parent, child, and folder templates
- Do NOT use Standard template ID `1930bbeb-...` as the templateId

### Parent/child rules

- Parent `__Standard Values` must set `__Masters` to the **child template**
- Parent must inherit `_HorizonDatasourceGrouping`
- Folder template `__Standard Values` must set `__Masters` to the **parent template**

### Rendering rules

- Must be a **JSON Rendering**
- `Datasource Template` must be a **full Sitecore path**, never a GUID
- `Datasource Location` must point to the folder template pattern
- `ComponentQuery` is **mandatory**
- `AddFieldEditorButton = 1`
- `Component Name [shared]` must be **PascalCase** and **exactly match** the TSX filename without extension (e.g. `ArticleCards` for `ArticleCards.tsx`)
- `Parameters Template [shared]` must be set to the **Item ID (GUID)** of the Rendering Parameters template — **never use a path**. Resolve the ID via MCP after creating the Rendering Parameters template.

### Preferred ComponentQuery pattern

**Always use the generic `field(name: "...")` accessor** instead of `... on TemplateName` fragments. XM Cloud instances often have multiple templates with the same name (from SXA, Foundation, Feature layers), which causes `... on` fragments to silently fail when the GraphQL type is disambiguated with a GUID suffix.

```graphql
query ComponentName($datasource: String!, $language: String!) {
  datasource: item(path: $datasource, language: $language) {
    title: field(name: "Title") { jsonValue }
    children {
      results {
        id
        title: field(name: "Title") { jsonValue }
        image: field(name: "Image") { jsonValue }
        link: field(name: "Link") { jsonValue }
      }
    }
  }
}
```

**Rules:**
- Use `field(name: "FieldName")` where `FieldName` is the **exact Sitecore field name** (PascalCase as created in the template)
- Use GraphQL aliases (camelCase) before the `field()` call to keep the data shape clean: `title: field(name: "Title")`
- Always include `id` in children results (required for React keys)
- Always wrap with `{ jsonValue }`
- **Do NOT use** `... on TemplateName` fragments — they are fragile in shared XM Cloud environments

### Experience Edge limits (test the query against Edge before it ships)

The layout service runs the ComponentQuery on Experience Edge. When Edge rejects it, the component simply gets **no data** (`fields` is
empty, the page shows the empty-datasource hint) and nothing in Sitecore reports an error. Two limits apply:
- **"Query is too complex to execute"**: grows with `children(first: N)` × the number of fields selected per child. A list with 12 child
  fields was rejected at `first: 50` and accepted at `first: 12`; one with 13 child fields needed `first: 9`.
- **"Query is too nested … max depth 15"**: grows with the number of aliased `field(name:) { jsonValue }` selections, not only with real nesting.

Rules:
- Set `children(first: N)` to the largest number of items any planned section really has (plus a little headroom), never a default 50.
- Many child fields: fetch them generically and map names to props in the component (a lookup by field name, not parsing a value):
  ```graphql
  children(first: 12) { results { id fields(ownFields: true) { name jsonValue } } }
  ```
- Before writing the query to the rendering, run it against the app's preview Edge endpoint (`SITECORE_EDGE_CONTEXT_ID` from the customer's
  `.env.local`, `https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=<id>`) with a real datasource id, and
  check the response has no `errors` (a one-off script in the demo's `tmp/`). Re-test after every field you add to the template.
- After placing the component, confirm the layout service returns `fields.data.datasource` for it, not an empty `fields`.

**Avoided pattern (causes silent failures):**
```graphql
# ❌ DO NOT USE — breaks when template name conflicts exist
... on ParentTemplateName { title { jsonValue } }
children { results { ... on ChildTemplateName { id title { jsonValue } } } }
```


### Example datasource item rule

`sitecore-rules.md` → Example datasource items: one parent from the parent template plus one or two children from the child template.

### Datasource template base templates rule

`sitecore-rules.md` → Base Templates (datasource templates): set right after creating EACH datasource template (parent and child), before its sections and fields.

### Insert options on datasource folder instance rule

`sitecore-rules.md` → Insert Options: `__Masters` = the parent datasource template on the folder template's Standard Values AND on the datasource folder item itself; the parent's Standard Values `__Masters` = the child template.

### Available Renderings rule

`sitecore-rules.md` → Available Renderings: append the new rendering id to `Renderings`, never replace the value.

### Verification rule

After create/update, verify:
- parent and child template paths, sections, fields, and `Type` values
- parent and child datasource template `Base template` includes `{1930BBEB-7805-471A-A3BE-4858AC7CF696}|{44A022DB-56D3-419A-B43B-E27E4D8E9C41}`
- parent and child `__Standard Values`
- parent `__Masters` points to child template
- parent inherits `_HorizonDatasourceGrouping`
- folder template `__Standard Values` sets `__Masters` to parent template
- datasource folder path
- insert options set on datasource folder instance (not only on folder template)
- `Component Name [shared]` is PascalCase matching TSX filename
- `Parameters Template [shared]` is set to the Item ID (GUID), not a path
- rendering datasource template (full path), datasource location, `ComponentQuery`, component name
- rendering is registered in Available Renderings (Page Content)

---

## React implementation rules

- Create under `src/components/pagecontent/<ComponentNamePascal>.tsx`
- Component props type **must** extend `ComponentProps` from `lib/component-props` — never define `params` manually
- Always use `params.styles` and `params.RenderingIdentifier` from `ComponentProps` in the wrapper element
- Match the neighbouring components in the same folder: Bootstrap layout, Sass partial under `src/assets/sass/components/`, site theme variables for colors.
- Always import from `@sitecore-content-sdk/nextjs`
- Use GraphQL datasource shape:
  - `fields.data.datasource` for the parent item
  - `fields.data.datasource.children.results` for child items
  - `.jsonValue` for all authorable field values
- Default `children.results` to `[]` if undefined
- Return `null` if the datasource is missing
- **All** Sitecore-managed fields must use SDK editable helpers (`Text`, `RichText`, `NextImage as ContentSdkImage`, `Link as ContentSdkLink`) — never use plain `<img>`, `<a>`, or hardcoded text for authorable fields



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
5. any follow-up verification or serialization requirements
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

**List-component-specific:**
- [ ] Request correctly classified as list component
- [ ] Parent template created with base templates `{1930BBEB-...}|{44A022DB-...}`
- [ ] Child template created with same base templates
- [ ] Parent + child sections + fields created with explicit `Type`
- [ ] Parent + child `__Standard Values` created and linked
- [ ] Parent `__Masters` → child template
- [ ] Parent inherits `_HorizonDatasourceGrouping`
- [ ] Folder template + SV created, `__Masters` → parent template
- [ ] Datasource folder under `/Data` with insert options on instance
- [ ] Example parent + child items created inside folder
- [ ] `Datasource Template` uses full Sitecore path
- [ ] `ComponentQuery` exists, uses `field(name: "...")` pattern, includes `children { results { id ... } }`
- [ ] TSX reads `fields.data.datasource.children.results` with `.jsonValue`

**Shared checks** — see `.skills/sitecore-reference/references/verification-checklist.md`

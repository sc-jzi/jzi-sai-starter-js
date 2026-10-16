---
name: sitecore-create-demo-variants
description: ALWAYS create client-named, pixel-matching variants (layout, spacing, styling from the prospect's screenshots) for every component a demo uses. Runs as phase 5.5 of every demo build; never optional.
---

# Sitecore create demo variants

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, take it from the plan being built. Shared reference docs live in `.cursor/skills/sitecore-reference/references/`.

Create a custom visual variant for each component on the demo page that replicates the exact layout, spacing, and styling from the client's homepage screenshot.

## ALWAYS pixel-perfect (no generic fallback)
Every demo gets a client-named variant for EVERY component it uses. There is no "generic is fine" option, no "only where the match is partial" and no question to the SE about it. A page that renders the shared `Default` look of a component is a failed build: it looks nothing like the prospect (the SE saw exactly this on a Heading CTA: right content, completely wrong look). The shared variants (`Default`, `WithLogoImage`, ...) stay untouched in the code as starting points; the demo's own variant is added next to them.

Runs as Phase 5.5 of `demo-from-transcript` T5 (after the theme is applied, before pages are built) and is never skipped because a component "already exists in Sitecore": the component exists, the VARIANT does not.

## Why this phase exists
The site theme variables (`--bg-*`, `--text-*`, `--roundness`) handle colors and corner radius, but NOT:
- Section-specific layout proportions (60/40 split vs 50/50)
- Card internal structure (image position, badge placement, price layout)
- Section padding and spacing ratios
- Background patterns (gradients, overlays, section dividers)
- Hover/animation effects specific to the client
- Icon styles and positioning
- Grid column counts and gap sizes
- Typography scale differences beyond font-family

A custom variant per component bridges the gap between "same colors" and "looks like their actual site."

---

## Load first
- `.cursor/skills/sitecore-reference/references/sitecore-rules.md` (if present)
- `.cursor/skills/sitecore-reference/references/react-component-guidelines.md` (if present)
- `.cursor/skills/sitecore-reference/references/site-theme-variables.md` (if present)
- `.cursor/skills/sitecore-add-variants/SKILL.md`
- `.cursor/skills/sitecore-reference/references/placeholders-and-variants.md` (how the variant is set on each component)

## Inputs (all inside the demo folder `industry-verticals/<customer>/docs/ai/demos/<customer>/` unless noted)
| Input | Source |
|---|---|
| Visual reference | EVERY screenshot available: the SE's inbox screenshots (see `materials.md` from intake), `theme/screenshot-desktop.png` and `theme/screenshot-hero.png` (site-scraper / Playwright), plus a Playwright capture of each prospect page that has a real URL (`node harness/scripts/screenshot.mjs`). Look at the actual pixels; do not design from the theme colours alone. |
| Plan | `demo-plan.yaml`: every section of every page (component + base variant) |
| Theme | `theme/theme.yaml` (applied as the `site-<customer>` theme) |
| Registry / manifest | `industry-verticals/prospera/docs/ai/catalog/component-registry.yaml`, shared manifest (read-only) |
If no screenshot exists at all (no inbox image, no URL, scraper blocked): derive the look from the transcript/RFP/brand material, say so in `manual-tasks.md`, and still create the variants; never fall back to Default.

## Naming convention
One variant per COMPONENT, named after the client in PascalCase (`site.variantName` in the plan; if absent derive it from `client.name`):
```
export const Default = ...      // shared variant, untouched
export const ConcentricUSA = ...  // this demo's variant
```
- Variant Definition item in Sitecore: same name, exactly the export name.
- Clean PascalCase for odd names: "Bank of America" → `BankOfAmerica`, "T-Mobile" → `TMobile`, "Ernst & Young" → `ErnstYoung`.
- A component whose different placements really look different on the prospect's site gets `<Client>`, `<Client>2`, ... (still one export each).
- Nothing is edited in `industry-verticals/prospera`: the code change happens in the customer's own app copy (`industry-verticals/<customer>/src/components/...`), where the shared TSX was copied.

## Workflow

### Step 1 — List every component the demo uses
**The list is `bootstrap-plan.json` → `components` (every entry, header area included), not your memory of the plan.** Every component in it gets a real client variant in code; a component you skip still has the client Variant Definition in Sitecore and the page SELECTS it, which renders "Content SDK component is missing React implementation" (Concentric run 2: Features had the variant `ConcentricUSA` selected but no `export const ConcentricUSA`). Start by running `node harness/scripts/variants-verify.mjs --customer <c> --fix`: it adds a safety-net alias (`export const <Client> = Default;`) to every component that lacks the export, so nothing can render the error box while you work, and it lists the aliases (`ALIAS`) you still owe real code for. From `demo-plan.yaml` also collect each distinct component across ALL pages (story pages, /Home, the navigation placeholder pages' `PageHeading` too), plus the header-area components: `Eyebrow`, `Header`, `Navigation` and the footer (`SiteFooter`). Each of them gets a client variant. **Eyebrow, Header and Navigation are generated, not hand-coded**: `node harness/scripts/header-kit.mjs --customer <c>` (run in bootstrap step 5 from the measured `header-styles.json`) already wrote them. Here you only verify and refine them (next step). Only the footer is coded by hand. Record the list with the section positions that show it. For each, take the BASE variant the plan names as the code to start from.

### Step 1b — Header: measured, not eyeballed
The header is the most visible part of the demo and the place where "looks roughly right" fails. Before anything else check that `header-styles.json` exists in the demo folder (else run `node harness/scripts/header-styles.mjs --customer <c> --url <prospect url>`; exit 3 = nothing found: read the values from the screenshot, write them into the same JSON shape, and note it in `manual-tasks.md`). The kit turns those numbers (eyebrow bar height and colours, link font size/weight/case/spacing, phone, search, CTA button, header band height, logo size, main menu font/colour/gap, menu item count) into the `<Client>` variants of Eyebrow, Header and Navigation plus `src/assets/sass/variants/header/_<client>.scss`. The eyebrow is hardcoded (config in `src/components/navigation/eyebrow-config.ts`) with search, phone and CTA; the Navigation variant renders the top level only. If a value is wrong, change the NUMBER in `header-styles.json` (or the generated SCSS) and re-run the kit (it replaces its own block, never duplicates); do not hand-edit the generated TSX block. Run `npx tsc --noEmit` in the app after the kit (the kit was only syntax-checked, not type-checked).

### Step 2 — Analyze the screenshot per section

For each component, inspect the screenshot region where it appears (Home first) and describe:

1. **Layout structure** — grid columns, flex direction, alignment, content width
2. **Spacing** — section padding (top/bottom), gap between elements, card internal padding
3. **Card/item style** — border, shadow, radius, background, hover effect
4. **Typography details** — heading size relative to body, weight, transform, letter-spacing
5. **Background** — solid color, gradient, image, pattern, overlay
6. **Interactive elements** — button style, link underline style, hover states
7. **Distinctive visual features** — anything unique to this client's section (e.g., orange left-border on PeopleCert's membership card, date chips on news cards)

Write this analysis to `industry-verticals/<customer>/docs/ai/demos/<customer>/variant-specs.yaml`:

```yaml
variantSpecs:
  - position: 3
    componentName: "HeroBanner"
    variantName: "PeopleCert"
    baseVariant: "Default"           # which existing variant to start from
    visualDifferences:
      layout: "centered text, no image, light background with subtle gradient"
      spacing: "py-20, max-w-3xl centered, gap-6 between heading and description"
      typography: "hero heading 56px/bold, subtitle 18px/regular, uppercase badge above heading"
      background: "white with very subtle radial gradient"
      buttons: "primary button sharp corners (radius 0), secondary as text link"
      distinctive: "rotating slide indicator dots below CTA"
    styleNotes:                       # becomes the variant's Sass partial
      section: "padding 80px 0; text-align center; very light gradient"
      heading: "56px bold, tight line-height"
      description: "18px, max-width 42rem, centered, 80% opacity"
      cta: "square corners, 12px 32px padding, uppercase 14px semibold"
```

### Step 3 — Create the variant code

For each section, create a new named export in the component's TSX file.

**Rules:**
- Start from the closest existing variant (the `baseVariant`) — copy its structure
- Add a modifier class on the wrapper (`variant-<kebab-name>`) and put the layout and spacing differences in a Sass partial at `src/assets/sass/variants/<kebab-component>/_<kebab-variant>.scss`, imported from `src/assets/sass/variants/index.scss`
- Keep ALL Sitecore field helpers intact (`Text`, `ContentSdkImage`, `ContentSdkLink`, `ContentSdkRichText`)
- Keep ALL `isEditing` guards
- Keep `params.styles` and `params.RenderingIdentifier` on the wrapper
- Use the site theme variables (`var(--bg-saturated)`, `var(--text-body)`, `var(--roundness)`, ...) for colors — do NOT hardcode hex values
- Reuse the app's button and layout classes (`button button-main`, Bootstrap grid) where they fit the design
- Add `/* PeopleCert variant */` comment at the top of the export for clarity

**Example:**

```tsx
/* PeopleCert variant: sharp corners, no shadows, compact pricing cards */
export const PeopleCert = ({ fields, params }: ProductPricingCardsProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  if (!fields?.data?.datasource) return <ProductPricingCardsDefaultComponent />;

  const cards = fields.data.datasource.children?.results ?? [];

  return (
    <div
      className={`component product-pricing-cards variant-peoplecert ${params?.styles || ''}`}
      id={params?.RenderingIdentifier || undefined}
    >
      <div className="container">
        <div className="row row-gap-4">
          {cards.map((card) => (
            <div key={card.id} className="col-md-4">
              <div className="pricing-card">
                {(isPageEditing || card.cardImage?.jsonValue?.value?.src) && (
                  <NextImage field={card.cardImage?.jsonValue} width={600} height={240} />
                )}
                <Text field={card.cardTitle?.jsonValue} tag="h3" />
                <RichText field={card.cardDescription?.jsonValue} />
                {(isPageEditing || card.cardLink?.jsonValue?.value?.href) && (
                  <Link field={card.cardLink?.jsonValue} className="button button-main" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

```scss
// src/assets/sass/variants/product-pricing-cards/_peoplecert.scss
.product-pricing-cards.variant-peoplecert {
  .pricing-card {
    border: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
    background: var(--bg-body);
  }
}
```

### Step 4 — Create the Sitecore Variant Definition items
For every component in the Step 1 list (bootstrap step 2 may already have created some; look first, create only what is missing):
1. The Variants container exists at `<site>/Presentation/Headless Variants/<container>`. **Container name = the RENDERING ITEM name, exactly, spaces and capitals included** (`Four Column CTA`, `Heading CTA`, `Three Column CTA`, `Page Content`), NOT the React component name (`FourColumnCta`): Sitecore matches the container to the layout definition item by name, and a container with the PascalCase name never matches (Concentric run 2: Four Column CTA rendered "Content SDK component is missing React implementation"). Take it from `bootstrap-plan.json` → `headlessVariantContainer` (= the rendering's item name from the manifest); if absent, the last segment of `rendering.path`. FIRST list `Presentation/Headless Variants` (the template site already has containers for many renderings): reuse an existing container with that exact name, create only the missing ones, and never create a second container whose name differs only in spaces/case. A stray wrong-named container from an earlier run: leave it, add one line to `manual-tasks.md`. After creating, list the folder again and confirm every `headlessVariantContainer` name in the plan is present.
2. Create the Variant Definition: `name` = the client variant name, template = Variant Definition (`4d50cdae-c2d9-4de8-b080-8f992bfb1b55`), parent = that container. Record the id in `site-manifest.json` → `variants.<Component>.<ClientName>`.
Definitions are independent items: create them in parallel.

### Step 5 — Make the demo USE the variants
- In `demo-plan.yaml` the section `variant:` stays the BASE variant the code started from (it is validated against the registry). The variant that is SET on every placed component is the client variant `site.variantName`, whatever the base was. `demo-build-pages` step 5 sets it on each placed component with the method ladder in `placeholders-and-variants.md` and confirms it with `get_components_on_page`.
- Header area: the partial design components (`Eyebrow`, `Header`, `Navigation`, `SiteFooter`) are switched to the client variant in bootstrap step 5, BEFORE their children are placed (placeholder names must exist in the code of the variant that is set: the Eyebrow variant offers `eyebrow-left` / `eyebrow-right`, the Header variant `header-left` / `header-right`; never invent others such as `eyebrow-links`). Use the same ladder (tool, then layout XML via `layout-variant.mjs patch`, then GraphQL); confirm by reading back. Here: only check, and set what is missing (footer).
- `variant-checklist.md` is only a fallback list for a component whose three routes all failed; it names the client variant, never `Default`.

### Step 6 — Update demo progress
`demo-progress.yaml`: `phases.phase5_5_variants.status: "complete"`, `variantsCreated: N`, and list any component still on a shared variant with the reason (there should be none).

### Step 7 — Validate
0. **Variant code gate:** `node harness/scripts/variants-verify.mjs --customer <c> --strict` must exit 0: every variant in `bootstrap-plan.json` is exported by its component file and NO safety-net alias is left (exit 4 lists them: write the real variant, or, if it genuinely cannot be done, keep the alias and put the component in `manual-tasks.md`; never end the phase with the gate failing silently).
1. In the customer app run the type check/lint (`npx tsc --noEmit` and the app's lint script if dependencies are installed; if not, `node harness/scripts/deps-check.mjs` says what is missing). Fix errors; a variant that does not compile is worse than none.
2. Every component in the list now exports `Default` (untouched) and the client variant; export names equal the Variant Definition names.
3. **Header gate (numeric, mandatory).** After the pages are built run `node harness/scripts/header-styles.mjs --customer <c> --url <demo home url> --out header-styles.demo.json --compare header-styles.json`. Exit 4 lists every measurement that is outside tolerance (colours, bar and header height, font size/weight/case, gaps, logo size, menu item count, contrast): fix the number or SCSS, re-run the kit, re-compare. One correction pass, then anything left goes to `manual-tasks.md`.
4. After the pages are built (T6): capture each built page (`get_page_screenshot`, or Playwright against the rendering host when it runs) and compare with the reference screenshot section by section. One correction pass for visible deviations in layout, spacing, type scale, background or imagery; anything left goes to `manual-tasks.md` with the section name. Do not stop the run.

---

## What to replicate vs what the site theme already handles

| Visual property | Handled by CSS vars? | Variant should customize? |
|----------------|---------------------|--------------------------|
| Primary/accent color | Yes (`--bg-saturated`, `--text-colored`, `--bg-accent`) | No — use `var()` |
| Body/heading text color | Yes (`--text-body`) | No — use `var()` |
| Corner radius | Yes (`--roundness`) | No — use `var()` |
| Font family | No (see `_fonts.scss`) | Only if the client font is loaded |
| Section background | Partial (`--bg-main`, `--bg-main-alt`) | **Yes** — if gradient/pattern/image |
| Grid columns / proportions | No | **Yes** |
| Section padding/spacing | No | **Yes** |
| Card internal layout | No | **Yes** |
| Hover/animation effects | No | **Yes** |
| Badge position/style | No | **Yes** |
| Icon style/placement | No | **Yes** |
| Image aspect ratio/position | No | **Yes** |
| Typography scale (size, weight, spacing) | No | **Yes** |
| Decorative elements (borders, dividers) | No | **Yes** |

**Rule:** Never hardcode colors; use the site theme variables. **Only exception: the generated header kit SCSS**, which uses the colours measured from the prospect's header (the theme variables do not cover eyebrow bar, CTA and menu colours). The variant controls layout, spacing, and structure. The theme controls the palette.

---

## Context-only components (NavigationHeader, SiteFooter)

These components have no datasource. Custom variants still work — they change the layout/structure of how context data is rendered.

For the header area use the header kit (see Step 1b). For NavigationHeader: logo position, nav link spacing, CTA button style, mobile menu behavior.
For SiteFooter: column count, link grouping, social icon placement, legal text position.

---

## Order of operations in the pipeline

```
Phase 4:   Apply theme (site theme block) — colors, radius
Phase 5:   Build custom components (if matchType: "custom")
Phase 5.5: Create demo variants (THIS PHASE) — layout, spacing, structure per section
Phase 6:   Assemble page — add components, wire datasources
Phase 6:   demo-build-pages sets the client variant on every section
```

Phase 5.5 runs AFTER theme application because the variants reference the site theme variables, which must be in place first.

Phase 5.5 runs BEFORE page assembly because the variant definitions must exist in Sitecore before the build can set them on the placed components.

---

## Output files

| File | Content |
|------|---------|
| `docs/ai/demos/<client>/variant-specs.yaml` | Per-section visual analysis + style plan |
| Component TSX files (modified) | New named export per component |
| Sitecore Variant Definition items | One per component (via MCP) |
| `variant-checklist.md` | Only fallback rows for variants that could not be set |
| `docs/ai/demos/<client>/demo-progress.yaml` | Updated phase status |

---

## Verification checklist

- [ ] `variants-verify.mjs --strict` exits 0 (every planned variant is exported in code, no alias left)
- [ ] Headless Variants containers are named like the RENDERING ITEMS (`Four Column CTA`), not the React names
- [ ] A client variant exists for EVERY component used (including Header, Eyebrow, footer); none left on Default
- [ ] `variant-specs.yaml` written with visual analysis per section
- [ ] Each custom variant uses the client's PascalCase name as the export name
- [ ] Each variant keeps ALL Sitecore field helpers intact (Text, RichText, NextImage, Link)
- [ ] Each variant keeps `isEditing` guards for empty fields
- [ ] Each variant uses `params.styles` and `params.RenderingIdentifier`
- [ ] Eyebrow/Header/Navigation variants come from `header-kit.mjs`, `tsc --noEmit` passes and the header gate (`--compare`) exited 0
- [ ] NO hardcoded hex colors (except the header kit SCSS) — all colors use site theme variables (`var(--bg-*)`, `var(--text-*)`)
- [ ] Each variant's layout styles are in a Sass partial under `src/assets/sass/variants/` imported from its `index.scss`
- [ ] Variant Definition items created in Sitecore under correct Variants container
- [ ] Variant export name exactly matches Variant Definition item name
- [ ] Type check / lint of the customer app passes after all variants were added
- [ ] Plan sections point at the client variant; build step 5 sets it
- [ ] Demo progress updated

**Shared checks** — see `.cursor/skills/sitecore-reference/references/verification-checklist.md`

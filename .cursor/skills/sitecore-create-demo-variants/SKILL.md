---
name: sitecore-create-demo-variants
description: Create custom per-section visual variants that replicate the client homepage screenshot (layout, spacing, styling). Use at build-demo phase 5.5 when sections have variantMatch partial/none or the SE wants pixel-matching.
---

# Sitecore create demo variants

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, ask first. Shared reference docs live in `.cursor/skills/sitecore-reference/references/`.

Create a custom visual variant for each component on the demo page that replicates the exact layout, spacing, and styling from the client's homepage screenshot.

## Trigger hints

Use this skill when:
- the demo builder pipeline reaches Phase 5.5 (after theme application, before page assembly)
- the user says "create custom variants", "match the screenshot exactly", "replicate the visual style"
- the build plan has sections where `variantMatch` is `"partial"` or `"none"`
- the user wants the demo to be pixel-perfect to the client's homepage, not just color-matched

## When NOT to use

- If the user explicitly says generic variants are fine ("just use Default variants")
- If the build plan has 0 sections needing custom variants and the user hasn't asked for pixel-perfect matching

## Why this phase exists

The site theme variables (`--bg-*`, `--text-*`, `--roundness`) handle colors and corner radius — but NOT:
- Section-specific layout proportions (60/40 split vs 50/50)
- Card internal structure (image position, badge placement, price layout)
- Section padding and spacing ratios
- Background patterns (gradients, overlays, section dividers)
- Hover/animation effects specific to the client
- Icon styles and positioning
- Grid column counts and gap sizes
- Typography scale differences beyond font-family

A custom variant for each section bridges the gap between "same colors" and "looks like their actual site."

---

## Load first

- `.cursor/skills/sitecore-reference/references/sitecore-rules.md`
- `.cursor/skills/sitecore-reference/references/react-component-guidelines.md`
- `.cursor/skills/sitecore-reference/references/site-theme-variables.md`
- `.cursor/skills/sitecore-add-variants/SKILL.md`

---

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| Desktop screenshot | `docs/ai/themes/<client>/screenshot-desktop.png` | Yes |
| Hero screenshot | `docs/ai/themes/<client>/screenshot-hero.png` | Yes |
| Build plan | `docs/ai/demos/<client>/build-plan.yaml` | Yes |
| Theme file | `docs/ai/themes/<client>.theme.yaml` | Yes |
| Component registry | `docs/ai/catalog/component-registry.yaml` | Yes |
| Manifest | `docs/ai/manifests/sitecore-manifest.yaml` | Yes |

---

## Naming convention

Each custom variant is named after the client in PascalCase:

```
export const Default = ...     // generic template variant
export const PeopleCert = ...  // custom variant matching PeopleCert's screenshot
```

This keeps the generic variants intact for other demos while adding a client-specific one.

**Variant Definition item name in Sitecore:** `PeopleCert` (must exactly match the export name)

**If the client name contains spaces or special characters**, use a clean PascalCase form:
- "Bank of America" → `BankOfAmerica`
- "T-Mobile" → `TMobile`
- "Ernst & Young" → `ErnstYoung`

---

## Workflow

### Step 1 — Read the build plan and identify sections

Read `docs/ai/demos/<client>/build-plan.yaml`. For each section in `buildOrder.phase1_sitecore`:

1. Note the `componentName`, `variant` (the closest existing match), and `sectionBackground`
2. Note the `description` and `variantReason` (visual details from the site analyzer)
3. Note `variantMatch` — if `"exact"` the existing variant already matches closely

**Decision per section:**

| `variantMatch` | Action |
|----------------|--------|
| `"none"` | **Must create** — no existing variant covers this layout |
| `"partial"` | **Should create** — existing variant is close but differs in specific ways |
| `"exact"` | **Optional** — create if user wants pixel-perfect, skip if "good enough" |

If the user asked for pixel-perfect matching, create for ALL sections (including `"exact"`).
If the user just wants the pipeline default, only create for `"none"` and `"partial"`.

### Step 2 — Analyze the screenshot per section

For each section that needs a custom variant, inspect the screenshot and describe:

1. **Layout structure** — grid columns, flex direction, alignment, content width
2. **Spacing** — section padding (top/bottom), gap between elements, card internal padding
3. **Card/item style** — border, shadow, radius, background, hover effect
4. **Typography details** — heading size relative to body, weight, transform, letter-spacing
5. **Background** — solid color, gradient, image, pattern, overlay
6. **Interactive elements** — button style, link underline style, hover states
7. **Distinctive visual features** — anything unique to this client's section (e.g., orange left-border on PeopleCert's membership card, date chips on news cards)

Write this analysis to `docs/ai/demos/<client>/variant-specs.yaml`:

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

### Step 4 — Create Sitecore Variant Definition items

For each new variant, create a Variant Definition item in Sitecore:

1. Check if the Variants container exists at `<headlessVariantsRoot>/<ComponentName>`
2. Create the Variant Definition item:
   - `name` = client PascalCase name (e.g., `PeopleCert`)
   - `template` = Variant Definition template ID `4d50cdae-c2d9-4de8-b080-8f992bfb1b55`
   - `parent` = the Variants container item

All variant definitions for a single demo can be created in **parallel** (they're independent items under different containers).

### Step 5 — Update the variant checklist

Update `docs/ai/demos/<client>/variant-checklist.md` to reference the custom variant names instead of generic ones:

**Before (generic):**
```markdown
| 1 | ProductPricingCards | Default | Default | — |
```

**After (custom):**
```markdown
| 1 | ProductPricingCards | Default | PeopleCert | {new-variant-id} |
```

### Step 6 — Update demo progress

Update `docs/ai/demos/<client>/demo-progress.yaml`:
- `phases.phase5_5_variants.status: "complete"`
- `phases.phase5_5_variants.variantsCreated: N`

### Step 7 — Validate

Run the component validator to confirm all new exports are valid:

```bash
node docs/ai/scripts/validate-components.mjs
```

This confirms every component still has `Default` and now also has the client variant.

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

**Rule:** Never hardcode colors; use the site theme variables. The variant controls layout, spacing, and structure. The theme controls the palette.

---

## Context-only components (NavigationHeader, SiteFooter)

These components have no datasource. Custom variants still work — they change the layout/structure of how context data is rendered.

For NavigationHeader: logo position, nav link spacing, CTA button style, mobile menu behavior.
For SiteFooter: column count, link grouping, social icon placement, legal text position.

---

## Order of operations in the pipeline

```
Phase 4:   Apply theme (site theme block) — colors, radius
Phase 5:   Build custom components (if matchType: "custom")
Phase 5.5: Create demo variants (THIS PHASE) — layout, spacing, structure per section
Phase 6:   Assemble page — add components, wire datasources
Phase 6+:  Variant checklist now references custom variant names
```

Phase 5.5 runs AFTER theme application because the variants reference the site theme variables, which must be in place first.

Phase 5.5 runs BEFORE page assembly because the variant definitions must exist in Sitecore before the variant checklist can reference them.

---

## Output files

| File | Content |
|------|---------|
| `docs/ai/demos/<client>/variant-specs.yaml` | Per-section visual analysis + style plan |
| Component TSX files (modified) | New named export per component |
| Sitecore Variant Definition items | One per component (via MCP) |
| `docs/ai/demos/<client>/variant-checklist.md` | Updated with custom variant names |
| `docs/ai/demos/<client>/demo-progress.yaml` | Updated phase status |

---

## Verification checklist

- [ ] Screenshot inspected for each section needing a custom variant
- [ ] `variant-specs.yaml` written with visual analysis per section
- [ ] Each custom variant uses the client's PascalCase name as the export name
- [ ] Each variant keeps ALL Sitecore field helpers intact (Text, RichText, NextImage, Link)
- [ ] Each variant keeps `isEditing` guards for empty fields
- [ ] Each variant uses `params.styles` and `params.RenderingIdentifier`
- [ ] NO hardcoded hex colors — all colors use site theme variables (`var(--bg-*)`, `var(--text-*)`)
- [ ] Each variant's layout styles are in a Sass partial under `src/assets/sass/variants/` imported from its `index.scss`
- [ ] Variant Definition items created in Sitecore under correct Variants container
- [ ] Variant export name exactly matches Variant Definition item name
- [ ] `validate-components.mjs` passes after all variants added
- [ ] Variant checklist updated with custom variant names
- [ ] Demo progress updated

**Shared checks** — see `.cursor/skills/sitecore-reference/references/verification-checklist.md`

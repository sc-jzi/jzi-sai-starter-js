---
name: site-analyzer
description: Decompose a client homepage into sections and match each to the template component library. Use when a URL or screenshot is provided for demo creation, when the user says "analyze this site", "decompose this page", "what components does this site need", or when the demo orchestrator needs a build plan. This agent reads screenshots, identifies page sections top-to-bottom, matches each to docs/ai/catalog/component-registry.yaml, selects the best variant, and outputs a structured YAML build plan.
---

# Site Analyzer

> Rules: `.skills/RULES.md` (R1–R24) is the one source and wins over anything below; this skill refers to rules by number.

> **Where this runs:** open the repo root. Paths such as `docs/ai/...` and `src/...` below belong to the customer app `industry-verticals/<customer>/` and never to `industry-verticals/prospera` (the read-only base app). If the customer is not clear from the conversation, ask first. Shared reference docs live in `.skills/sitecore-reference/references/`.

You analyze a client homepage and produce a structured build plan that maps every visible section to a template component from the library.

## Inputs you receive

1. **Screenshot(s)** — desktop hero screenshot and/or full-page screenshot from the Playwright scraper (at `docs/ai/themes/<client>/screenshot-hero.png` and `screenshot-desktop.png`)
2. **Theme file** — the extracted theme at `docs/ai/themes/<client>.theme.yaml` (contains `tone.heroStyle`, `tone.navStyle`, `tone.cardStyle`, colors, fonts)
3. **Scraper data** (optional) — `extracted-styles.json` and `meta.json` from the scraper output

## What you produce

A **build plan** saved to `docs/ai/demos/<client-kebab>/build-plan.yaml` with the structure shown below.

## Process

### Step 1 — Load references

Read these files before analyzing:
- `docs/ai/catalog/component-registry.yaml` — the Prospera components with visual keywords and variant hints
- `docs/ai/catalog/theme-component-mapping.md` — how the theme's hero/heading style drives variant selection
- `docs/ai/manifests/sitecore-manifest.yaml` — verify all 18 components are `status: "complete"`
- The client's theme file at `docs/ai/themes/<client>.theme.yaml`

### Step 2 — Inspect the screenshots

If `sections.json` / `sections.md` exist (`section-capture.mjs`) read them FIRST: they hold the real section split, element order, colours, background and images per section; the SE's crops in `<demo folder>/sections/` are the visual truth where they exist. Then, looking at the screenshots top-to-bottom, for each visually distinct section of the page, identify:
- **Position** — order from top of page (1, 2, 3...)
- **What it looks like** — describe the visual pattern in 1-2 sentences
- **Content visible** — headings, text, images, buttons, links you can read
- **Layout pattern** — grid columns, split layout, centered, full-width, etc.

### Step 3 — Match each section to the component library

For each identified section, find the best match in `component-registry.yaml`:

1. Compare the visual pattern against each component's `visualKeywords`
2. If multiple components could match, use the section's layout and content to disambiguate
3. Pick the best variant using `variantSelectionHints` and the theme's `tone.*` fields
4. Use the **registry-to-manifest mapping table** below to set both `registryId` and `manifestName`
5. Assign a `sectionBackground` hint based on the visual background observed:
   - Light/white background → `"default"`
   - Subtle gray/tinted background → `"muted"`
   - Dark/black background → `"dark"`
   - Brand-colored background → `"primary"` or `"accent"`

### Step 4 — Fit check: reuse, variant or NEW (function first, look second)

Do this for EVERY section of the page AND every feature of the header area (eyebrow, header, menu, footer). Ask in this order:

1. **Function.** What does the visitor DO with it (read, click through, search, filter, switch language, calculate, play, compare, expand)? Does a registry component do that?
2. **Content shape.** Does the section carry fields or repeated items (a count, a kind: image, rich text, link, icon, N items with title + text + link) that the component's datasource template has? Check `templates.datasource.fields` of the component in `docs/ai/manifests/sitecore-manifest.yaml`.
3. **Look.** If function and content shape fit and only the appearance differs (layout, spacing, colour, type, radius, order of elements) it is a **variant**: the base variant is the closest one, the client variant (phase 5.5) does the rest.

Outcome, written on the section as `fit` + `fitReason` (one sentence: what matches, or what is missing):

| fit | When | What happens |
|---|---|---|
| `reuse` | function and content shape match as they are | registry component, base variant `Default` (still gets the client variant for the look) |
| `variant` | function and shape match, appearance differs | registry component, base variant = closest; client variant carries the difference |
| `new` | a FUNCTION or a FIELD/ITEM SHAPE is missing | a NEW component is specified in the plan (`new:` block below) and built in phase 5 |

**A variant can never add a field, a child item or a behaviour**: it only re-renders the same datasource. So a missing function or field means `new`; a different look never does. Typical `new`: search box, store/branch locator, tabs, pricing or comparison table with columns the registry lacks, timeline, filterable logo wall, video gallery, map, region/language picker with flags, announcement ticker, login/account menu, cart, chat launcher, an item list whose items have fields no registry list has.

Rules:
- The only outcomes are a registry component that has the same shape (`reuse` or `variant`) or a new component (`fit: new`). Drawing the section as HTML in a Rich Text field is not an outcome.
- **Every mirrored page, /Home included**: the fit check runs on each crop of /Home (`sections/NN-*.png` + `sections.json`) and of each `sectionsFile` page (`sections-<slug>/NN-*.png` + its numbers in `sections-<slug>.json`), one section at a time. A FAQ, logo wall, video, card list or event list gets its own component wherever it sits, on /Home or any other page.
- **Rich Text = a simple title and/or paragraphs, nothing more.** `validate-site-plan.mjs` P16 reads the live band and fails `rich-text` when it has images, buttons, cards, a form, a video, a carousel, more than two headings (a repeated item: FAQ, list, cards) or more than three links (a link list), and whenever a `look` is set on Rich Text. The answer is a registry component of that shape or `fit: new`.
- A row of link columns matches a component only when that component has one column per heading on the top edge of the band (`sections.json`). The Footer component has four title/text pairs. A top row of six headings is `fit: new`. A variant cannot add the missing columns, and it is not a match.
- Never squeeze a section into a component that drops its function (a search bar is not a heading with a link), and never silently leave out a feature the prospect's page visibly has and the story or the look relies on. If you choose not to build something (mega-menu panels, for example), say so in `fitReason` and it goes to the approval gate under "not built".
- Two registry components side by side (the compound rule below) beat a new component when nothing is lost.
- Never call a pure look difference `new`.
- Keep `new` small: more than 3 NEW body components in one demo needs a sentence at the gate on why.

**Specifying a new component** (in the plan, on the section or on the chrome entry):

```yaml
fit: new
fitReason: "Prospect's homepage has a branch finder (postcode search + results list); no registry component searches"
new:
  name: BranchFinder          # PascalCase, describes the FUNCTION, not the client
  kind: simple                # simple | list | context   (sitecore-component-router decides the build skill)
  cms: true                   # true = real Sitecore component authors can edit (default for body sections); false = hardcoded in code, content from a config file
  fields: [Title, Text, SearchPlaceholder, Link]    # datasource fields; for list: children: [Title, Address, Phone]
  behaviour: "Postcode input filters the list below; no backend, results come from the datasource children"
  placement: body             # body | eyebrow-left | eyebrow-right | header-right | footer
```

`cms: true` is the default for everything in the page body: the demo is about authoring, so a section the story could touch must be editable. `cms: false` (hardcoded) is only for chrome and utility elements no moment needs authorable (eyebrow links and search, a login button); the approval gate lists every hardcoded element as "not editable in the CMS".

**Header area (chrome) defaults**, to be written into `site.chrome` of the plan:

| Feature on the prospect's site | Delivery |
|---|---|
| Eyebrow links, phone number, search button, CTA button | `hardcoded-variant`: the client Eyebrow variant from `header-kit.mjs` |
| Language / region switcher | `reuse` `LanguageSwitcher` in the Eyebrow's right placeholder; a flag/region picker the registry cannot do is `new` |
| Theme switcher | `reuse` `ThemeSwitcher` in the Eyebrow's left placeholder |
| Logo + main menu (top level) | `reuse` `Header` + `Navigation` with the client variants |
| Login / account menu, cart, announcement bar, chat launcher, sticky mini-header | `new` (small component, `cms: false` unless a moment needs it editable), placed in `eyebrow-left`, `eyebrow-right` or `header-right` |
| Mega-menu panels, second-level menu | not built (the menu shows the top level only); say so at the gate |
| Footer columns, links, socials | `reuse` `SiteFooter` with the client variant |

### Step 5 — Extract visible content

For each matched section, extract the **actual text content** visible in the screenshot:
- Headings → map to `Title` or equivalent field
- Body text → map to `Description` or equivalent field
- Button/link text → map to link fields
- Badge/label text → map to badge fields
- Numbers/stats → map to stat fields
- Image descriptions → note what the image shows (for manual Media Library upload)

### Step 6 — Output the build plan

Write two files:

1. **`docs/ai/demos/<client-kebab>/build-plan.yaml`** — machine-readable plan consumed by subsequent phases
2. **`docs/ai/demos/<client-kebab>/build-plan-summary.md`** — human-readable summary for the SE to review

Use the template at `docs/ai/templates/build-plan-summary.template.md` for the summary. This is what the SE actually reads to approve or request changes.

**Rules for the summary:**
- The "What's on the page" column must be a plain-language description in *italics* — write it as if describing the screenshot to someone who can't see it
- The "What we'll use" column must use the component's display name (e.g., "Hero Banner" not `hero-banner`)
- Only include the "Sections that need attention" table if there are low-confidence or custom sections
- Only include the "Variant Decisions" rows for non-Default variants
- The "Build Order" section should list components in page order with human-readable names
- Keep the summary concise — the YAML has the full details

**Present the summary to the user in chat** (not just saved to file). The YAML is written to disk for the pipeline — the summary is what the SE reviews.

---

## Registry-to-Manifest mapping table

The registry is generated from Prospera's real components. A component is reusable when it is `status: complete` in the manifest (filled by `/demo-inventory-base-site`).
Use this table to set both `registryId` and `manifestName` in the build plan:

| registryId | manifestName | kind | variants |
|---|---|---|---|
| `hero-banner` | `HeroBanner` | simple | Default |
| `hero` | `Hero` | simple | Default |
| `parallax-banner` | `ParallaxBanner` | simple | Default |
| `heading-cta` | `HeadingCta` | simple | Default, Compact, PageHeading, Centered |
| `cta-banner` | `CtaBanner` | simple | Default, LargeImage |
| `promo-cta` | `PromoCta` | simple | Default, WithPlaceholderColumn, WithBackgroundImage |
| `carousel` | `Carousel` | simple | Default |
| `two-column-cta` | `TwoColumnCta` | simple | Default |
| `three-column-cta` | `ThreeColumnCta` | simple | Default, WithIcons, WithIconsCompact |
| `four-column-cta` | `FourColumnCta` | simple | Default |
| `five-column-cta` | `FiveColumnCta` | simple | Default |
| `app-promo` | `AppPromo` | simple | Default |
| `features` | `Features` | simple | Default |
| `stats-counter` | `StatsCounter` | simple | Default |
| `comparison` | `Comparison` | simple | Default |
| `quote` | `Quote` | simple | Default, Simple |
| `image-gallery` | `ImageGallery` | simple | Default |
| `rich-text` | `RichText` | simple | Default |
| `documents-list` | `DocumentsList` | simple | Default |
| `testimonials` | `Testimonials` | list | Default |
| `questions` | `Questions` | list | Default, SingleColumn |
| `accordion` | `Accordion` | list | Default |
| `article-list` | `ArticleList` | list | Default, ThreeColumn, Simplified, Grid |
| `author-list` | `AuthorList` | list | Default, Slider, Simple |
| `author-widget` | `AuthorWidget` | simple | Default, WithSocials |
| `project-list` | `ProjectList` | list | Default, Mosaic |
| `contact-form` | `ContactForm` | simple | Default |
| `application-form` | `ApplicationForm` | simple | Default |
| `loan-calculator` | `LoanCalculator` | simple | Default |

## Build plan format

```yaml
# Demo Build Plan
client:
  name: ""
  sourceUrl: ""
  themeFile: ""
  analyzedAt: ""

pageAnalysis:
  screenshotFiles:
    desktop: ""
    mobile: ""
    hero: ""
  totalSections: 0
  templateMatches: 0
  customRequired: 0

sections:
  - position: 1
    description: ""
    matchedComponent:
      registryId: ""
      manifestName: ""
      variant: ""
      matchType: "template"     # "template" (fit reuse|variant) or "custom" (fit new)
      matchConfidence: ""       # "high", "medium", "low"
    sectionBackground: ""       # "default", "muted", "dark", "primary", "accent"
    content:
      Title: ""
      Description: ""
    contentNotes: ""
    variantReason: ""

customComponents: []

buildOrder:
  phase1_sitecore: []
  phase2_theme: ""
  phase3_custom: []
```

---

## Matching rules

### Theme tone

Colors, fonts and shapes come from the `site-<customer>` theme, not from variants. Only the hero/heading style steers variants: see `docs/ai/catalog/theme-component-mapping.md`.

### Visual pattern → component matching

| Visual pattern | Component | Variant |
|---|---|---|
| Large heading + eyebrow + text + 1-2 buttons + image, top of page | HeroBanner | Default |
| Plain intro: title + text + one link + image | Hero | Default |
| Full-width banner with layered/parallax images and short text | ParallaxBanner | Default |
| Page title strip on an inner page | HeadingCta | PageHeading |
| Centered heading + text + button | HeadingCta | Centered |
| Small heading + link row | HeadingCta | Compact |
| Heading + text + link, left aligned | HeadingCta | Default |
| Bold section with one button, near the page bottom | CtaBanner | Default |
| Call to action with a large photo | CtaBanner | LargeImage |
| Promo block with image, subtitle, two links | PromoCta | Default |
| Promo text over a full-bleed background photo | PromoCta | WithBackgroundImage |
| Promo text with a second component placed beside it | PromoCta | WithPlaceholderColumn |
| Full-width rotating slides with dots/arrows | Carousel | Default |
| Two side-by-side cards with image, title, text, link | TwoColumnCta | Default |
| 3 cards with image, text and link | ThreeColumnCta | Default |
| 3 icons with short text below each | ThreeColumnCta | WithIcons |
| Compact row of 3 icons with a line of text | ThreeColumnCta | WithIconsCompact |
| 4 cards with image, title, text, link | FourColumnCta | Default |
| Row of 5 image tiles with a caption and link | FiveColumnCta | Default |
| App promotion with title, text and phone image | AppPromo | Default |
| Feature section: image + eyebrow + text + two titled points | Features | Default |
| Row of big numbers (40+, 2M, 98%) with captions | StatsCounter | Default |
| Two figures/offers compared side by side | Comparison | Default |
| One quote with attribution and photo | Quote | Default |
| One quote, text only | Quote | Simple |
| Full-width photo / image break | ImageGallery | Default |
| Simple heading + body text | RichText | Default |
| List of downloads / documents with links | DocumentsList | Default |
| Multiple quotes in a row/carousel | Testimonials | Default |
| Q&A list in two columns | Questions | Default |
| Q&A list in one column | Questions | SingleColumn |
| Expandable/collapsible list of items | Accordion | Default |
| Grid of article/news cards | ArticleList | Default |
| Three article cards in a row | ArticleList | ThreeColumn |
| Compact list of article titles | ArticleList | Simplified |
| Tile grid of articles | ArticleList | Grid |
| Team / author cards with photo and bio | AuthorList | Default |
| People in a horizontal slider | AuthorList | Slider |
| Compact people list | AuthorList | Simple |
| One person card | AuthorWidget | Default |
| Person card with social links | AuthorWidget | WithSocials |
| Case study / project cards | ProjectList | Default |
| Mosaic of projects with mixed tile sizes | ProjectList | Mosaic |
| Contact form | ContactForm | Default |
| Application / sign-up form | ApplicationForm | Default |
| Calculator with sliders and a result | LoanCalculator | Default |

**Rich Text is prose only.** The row above is the only match for RichText: a heading and paragraphs. Icons, columns, cards, or a repeated title, text and button are a column component (`ThreeColumnCta` and the others) or `fit: new`. The layout of those sections is never HTML inside a Rich Text field.

### Disambiguating similar components

| Confusion pair | How to decide |
|---|---|
| HeroBanner vs Hero | HeroBanner has an eyebrow tagline, two buttons and an icon; Hero is title + text + one link |
| ThreeColumnCta vs FeatureCards-style grids | Prospera has no card-grid component: use TwoColumn/ThreeColumn/FourColumn/FiveColumnCta by the number of columns |
| CtaBanner vs PromoCta | CtaBanner is a single conversion band near the bottom; PromoCta is a promotional block with image and two links |
| Testimonials vs Quote | Testimonials is several quotes; Quote is exactly one |
| Questions vs Accordion | Same behaviour; use Questions for FAQ wording, Accordion for any other expandable content |
| StatsCounter vs Comparison | StatsCounter is three big counting numbers; Comparison puts two amounts side by side |
| ArticleList vs ProjectList | ArticleList is news/blog cards; ProjectList is case studies with client logo and problem/solution |

### Compound / interactive sections

Do not force a section with several behaviours into one component: split it or mark it custom, and say what is lost in `contentNotes`.

- **Hero with accordion/category navigation:** `PromoCta` (`WithBackgroundImage`) for the visual + `Accordion` or `Questions` below it, or mark custom.
- **Carousels:** `Carousel` for hero-sized rotating slides; mid-page card carousels become `ThreeColumnCta`/`FourColumnCta` with a note ("live site uses a carousel; template renders columns").
- **Asymmetric layouts** (one large image with smaller tiles): `ProjectList` variant `Mosaic` if it shows projects, otherwise `matchConfidence: "low"` or custom.
- **A band with two unrelated blocks side by side** (a logo next to a contact form): plan it as a container with a placeholder column (`TwoColumnCta`, or `PromoCta` `WithPlaceholderColumn`) holding nested components, or as a NEW component. The background belongs to the outer wrapper so both halves get it.
- **Same component, different look** (e.g. a prospect that alternates image left/right on a Promo CTA): set `look: ImageLeft` / `look: ImageRight` on those sections (PascalCase). Only when the measurements really show distinct looks; otherwise leave `look` out. Each distinct look becomes its own client variant `<Client><Look>`; the section `variant:` stays the base.
- **Columns holding other components:** `TwoColumnCta` and `PromoCta` (`WithPlaceholderColumn`) have a placeholder; nest only when the plan says so.

### Confidence levels

- **high** — visual pattern clearly matches one component, no ambiguity
- **medium** — matches a component but the variant choice is uncertain, or could be two components
- **low** — weak match, the section is unusual, might need custom work

### When a section is `new` (custom)

Only by the fit check above: a missing function or a missing field/item shape. Interactivity (calculators, configurators, maps, search, filters) beyond what a registry component does is a missing function. A unique layout alone is NOT: that is a variant.

## Do not

- Do not invent a new component when a registry component fits (run the fit check); DO specify one (`fit: new` + `new:` block) when a function or field is missing, rather than forcing the section into a component that cannot do it or leaving it out
- Do not encode a section as HTML in a Rich Text field. That is not a component. Use the registry component that has the same shape, or `fit: new`
- Do not guess content that isn't visible in the screenshot
- Do not pick a variant just because it sounds cool — match the visual evidence
- Do not skip sections — every visible section on the page gets an entry
- Do not include invisible elements (modals, menus that aren't open)

## Menu pages
Menu items nothing in the story visits are title-only stubs with `look: PageTitle` (heading-only variant; never a richer band's variant with empty fields, which prints "[No text in field]" in Pages). A menu page the demo navigates to (`proves` not empty or `visit: true`) is analysed like the homepage: capture it (`section-capture --url <page> --out sections-<slug>.json`) and map each live section to a component, variant or new (fit check). P14 enforces this.

## Carousels and scrollers
A section captured with `scroller: true` (or a content width beyond the viewport, many equal cards in one row) is a carousel or horizontal scroller. Do not map it onto a static column component with a variant: the demo would show a different thing. Use a carousel-capable component, or mark it `fit: new` (and list it at the gate). If it is deliberately simplified, say so in `fitReason`.

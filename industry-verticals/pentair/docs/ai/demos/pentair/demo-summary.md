# Pentair — Demo Build Summary

> **Client:** Pentair  
> **Source:** https://www.pentair.com/  
> **Built:** 2026-08-25  
> **Page:** `/sitecore/content/manufacturing/pentair/Home` `{6B8D16AD-770D-4CB9-89F1-6A7011FF3F48}`

Pixel-perfect variants, theme tokens, Barlow fonts, and all datasource items are ready. **Page assembly must be finished in Pages** — Agent API layout writes (`add_component_on_page`, `set_component_datasource`) returned HTTP 500 after creating orphan local datasources (those orphans were deleted).

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | 6 (Hero, ThreeColumnCta, PromoCta, HeadingCta, Header, Footer) |
| Custom components built | 0 |
| Custom variants created | 8 |
| Datasource items created | 9 |
| Fields populated | ~50 |
| Images uploaded | 18 / 18 |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | Header | Pentair | _partial design_ | ⚠️ Set variant on Header partial |
| 2 | Hero | Pentair | Pentair - Hero `{5501351D-...}` | ⚠️ Add + wire in Pages |
| 3 | Three Column CTA | Pentair | Pentair - Move Improve Enjoy `{847002A3-...}` | ⚠️ Rewire existing `{D54D53B4-...}` |
| 4 | Three Column CTA | PentairSpotlight | Pentair - Sustainability Spotlight `{4F12A29B-...}` | ⚠️ Add + wire in Pages |
| 5 | Promo CTA | Pentair | Pentair - Careers `{2007DA69-...}` | ⚠️ Rewire existing `{633506E7-...}` |
| 6 | Promo CTA | Pentair | Pentair - Innovation mySudmo `{89B4E519-...}` | ⚠️ Rewire existing `{1A516B9B-...}` |
| 7 | Promo CTA | PentairAlt | Pentair - Innovation Everpure `{09A7A6B2-...}` | ⚠️ Add + wire in Pages |
| 8 | Promo CTA | Pentair | Pentair - Innovation IntelliFlo3 `{937026FF-...}` | ⚠️ Add + wire in Pages |
| 9 | Heading CTA | Pentair | Pentair - News Releases `{7957887F-...}` | ⚠️ Add to Available Renderings, then place |
| 10 | Footer | Pentair | Pentair - Footer `{C47B0E77-...}` | ⚠️ Set variant + datasource on Footer partial |

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `#09244F` |
| Secondary / teal | `#006E96` |
| Accent / leaf green | `#4F8309` |
| CTA green | `#6EB70B` |
| Heading font | Barlow Condensed 300, uppercase |
| Body font | Barlow 400 |
| Delivery method | `.site-pentair` tokens in `_colors.scss` + `_pentair-demo.scss` |
| Google Fonts | Loaded from `_fonts.scss` and `src/app/layout.tsx` |

Site name in preview is **`Pentair`**. `getSiteThemeClass` maps `Pentair` / `pentair` → `site-pentair`.

Hero CTA is **white fill + green type** with a triangle flourish (matches the live site, not a filled green button).

> Theme takes effect on the next rendering-host restart.

---

## Image Upload Summary

**Content Hub:** `https://jzi-verticals.sitecoresandbox.cloud/`

| Result | Count |
|--------|-------|
| Uploaded + approved | 18 |
| Uploaded, pending approval | 0 |
| Failed | 0 |
| Skipped | 0 |
| **Total** | **18** |

All 18 images uploaded and approved. Image fields are already set on the shared datasource items under `Data/Promos`.

---

## Manual Tasks

Full checklist: `docs/ai/demos/pentair/manual-tasks.md`  
Variants: `docs/ai/demos/pentair/variant-checklist.md`

### Variant selection

Set **Pentair** / **PentairAlt** / **PentairSpotlight** on each component after it is on the page. The rendering host must include the new TSX exports.

### Context-only

Header and Footer live in partial designs. Assign the Pentair variants there. Assign `Pentair - Footer` as the Footer datasource.

### Cleanup

Remove leftover Financial starter components (Carousel, Five Column CTA, Two Column CTA + Comparisons, Article List, Documents List, App Promo, extra Promo CTA).

### Heading CTA

Heading CTA is **not** in this site's Available Renderings for `headless-main`. Add it before placing News Releases.

### Personalization

Optional after the default page matches the screenshot.

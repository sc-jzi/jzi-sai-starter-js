# Dwyer Omega — Build Plan

> Revised after review. Quick Order is part of the Hero Banner. Featured products are `FeaturedProductsCarousel`. Shop by Industry is one `IndustryList` (click flips the card).

## Page sections (top to bottom)

| # | What's on the page | Component | Variant |
|---|-------------------|-----------|---------|
| 1 | Utility bar | Eyebrow | DwyerOmega |
| 2 | Navy navigation | Header | DwyerOmega |
| 3–4 | Welcome copy, product photo, Quick Order | Hero Banner | DwyerOmega |
| 5–6 | Featured products, four at a time, arrows disable at the ends | Featured Products Carousel | DwyerOmega |
| 7 | Help is here | Promo CTA | DwyerOmegaHelp |
| 8 | Resources and Newsletter cards | Two Column CTA | DwyerOmegaHelpCards |
| 9 | Brand story | Promo CTA | DwyerOmegaStory |
| 10–11 | Six industry cards; click flips to products | Industry List | DwyerOmega |
| 12 | Navy Quick Links pills | Heading CTA | DwyerOmegaQuickLinks |
| 13 | Dark footer | Footer | DwyerOmega |

Variants are selected in Pages. See `variant-checklist.md`. Leftover PLAY! components are listed in `manual-tasks.md`.

---

## Original mapping (superseded)

The tables below are the first pass, before Quick Order, the carousel, and the industry flip were combined.

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Light utility bar with phone, search, Contact Us, cart, and My Account_ | Eyebrow | DwyerOmega | High | Context-only, header partial |
| 2 | _Navy bar with DWYEROMEGA logo, red All Products, six nav items, and US flag_ | Header | DwyerOmega | High | Context-only, header partial |
| 3 | _SOR welcome headline, red Read more, and a gray control-box product photo_ | Hero Banner | DwyerOmega | High | Split copy + product image |
| 4 | _Quick Order card with part number / qty rows and Add to List_ | Heading CTA | DwyerOmegaQuickOrder | Medium | Presentational form chrome |
| 5 | _Centered Featured Products title and Browse All Products_ | Heading CTA | Centered | High | Existing variant |
| 6 | _Four product photos with captions and carousel arrows_ | Four Column CTA | DwyerOmegaProducts | High | Live site is a carousel |
| 7 | _Specialist photo and CONTACT help-center copy_ | Promo CTA | DwyerOmegaHelp | High | Re-wire existing Promo CTA |
| 8 | _Two white cards: Resources and Newsletter_ | Two Column CTA | DwyerOmegaHelpCards | High | Re-wire existing Two Column CTA |
| 9 | _DwyerOmega story copy plus factory photo_ | Promo CTA | DwyerOmegaStory | High | Second Promo CTA |
| 10 | _Shop by Industry tiles: Beverage, Food, Medical_ | Three Column CTA | DwyerOmegaIndustry | High | Re-wire existing |
| 11 | _Shop by Industry tiles: Cold Chain, Aerospace, Read our Blog_ | Three Column CTA | DwyerOmegaIndustry | High | New instance |
| 12 | _Navy Quick Links pill row_ | Heading CTA | DwyerOmegaQuickLinks | Medium | Extra pills in Text HTML |
| 13 | _Dark footer with Support, Company, Contact Us, TechAdvantage Club_ | Footer | DwyerOmega | High | Context-only, footer partial |

---

## Sections that need attention

> [!WARNING]
> Review these before approving — layout or fields are a stretch vs the screenshot.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3+4 | _Hero copy, product photo, and Quick Order sit in one row_ | Two components will stack in `headless-main` | Pixel-perfect: place Quick Order in the Hero Banner `hero-banner` placeholder |
| 4 | _Live part-number form_ | Heading CTA has no form fields | Variant draws presentational inputs; not wired to commerce |
| 6 | _Product carousel with arrows_ | Four Column CTA is a static row | Phase 5.5 can add arrow chrome; generic is four tiles |
| 7–9 | _Help block is a 2×2 mix of photo, cards, and story_ | Three stacked components vs one mosaic | Pixel-perfect variants can tighten spacing; structure stays three items |
| 12 | _Seven Quick Link pills_ | Heading CTA has one Link field | Remaining pills rendered from Text / variant chrome |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Eyebrow | DwyerOmega | Light catalog utility bar, not PLAY! banking |
| 2 | Header | DwyerOmega | Navy bar + red All Products pill |
| 3 | Hero Banner | DwyerOmega | Light industrial split, no dotted accents |
| 4 | Heading CTA | DwyerOmegaQuickOrder | Card with fake part/qty rows |
| 5 | Heading CTA | Centered | Matches the catalog section title |
| 6 | Four Column CTA | DwyerOmegaProducts | Product tiles, not banking columns |
| 7 | Promo CTA | DwyerOmegaHelp | Photo-left help specialist |
| 8 | Two Column CTA | DwyerOmegaHelpCards | Icon cards, not image columns |
| 9 | Promo CTA | DwyerOmegaStory | Logo/copy + factory photo |
| 10–11 | Three Column CTA | DwyerOmegaIndustry | Photo tiles with overlay labels |
| 12 | Heading CTA | DwyerOmegaQuickLinks | Dark pill bar |
| 13 | Footer | DwyerOmega | Dark industrial columns |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Hero Banner | Simple (1 item) |
| 4 | Heading CTA | Simple (1 item) — Quick Order |
| 5 | Heading CTA | Simple (1 item) — Featured Products |
| 6 | Four Column CTA | Simple (1 item, 4 image/title/link slots) |
| 7 | Promo CTA | Simple (1 item) — re-wire existing |
| 8 | Two Column CTA | Simple (1 item) — re-wire existing |
| 9 | Promo CTA | Simple (1 item) — re-wire existing |
| 10 | Three Column CTA | Simple (1 item) — re-wire existing |
| 11 | Three Column CTA | Simple (1 item) — new instance |
| 12 | Heading CTA | Simple (1 item) — Quick Links |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Eyebrow | Header partial design | Select DwyerOmega variant |
| 2 | Header | Header partial design | Select DwyerOmega variant; logo |
| 13 | Footer | Footer partial design | Assign Dwyer Omega Footer datasource + variant |

### Custom components needed

None — all sections matched Financial template components.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. HeroBanner (SOR welcome)
  2. HeadingCta (Quick Order)
  3. HeadingCta (Featured Products)
  4. FourColumnCta (featured products)
  5. PromoCta (help specialist)
  6. TwoColumnCta (resources / newsletter)
  7. PromoCta (brand story)
  8. ThreeColumnCta (industry row 1)
  9. ThreeColumnCta (industry row 2)
  10. HeadingCta (quick links)
  11. Footer (partial)

Phase 2 — Apply theme (CSS variables + Source Sans 3)

Phase 3 — Custom components (none)
```

Home leftovers to remove in Pages after assembly: Carousel, Five Column CTA, Article List, Documents List, App Promo, extra Promo CTA.

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic template variants sufficient?

> Reply "approved" to proceed, or describe any changes needed.

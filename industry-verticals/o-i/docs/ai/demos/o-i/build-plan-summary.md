# O-I — Build Plan

> **Source:** https://www.o-i.com/
> **Analyzed:** 2026-09-21
> **Approved:** 2026-09-21 (section 4 changed to Carousel; pixel-perfect OI variants required)
> **Sections:** 8 (8 template, 0 custom)

Implementation maps visual registry semantics to **Financial starter** components (same approach as Akamai). Content items will be created under `/sitecore/content/manufacturing/o-i/Data`.

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Dark bar with white O-I logo, four primary nav items, utility links, search, gold Catalog pill, and EN_ | Header | OI | High | Context-only, lives in header partial |
| 2 | _2×2 news cards with photos, gold rounded borders, titles, and dates_ | Four Column CTA | OINewsGrid | High | Needs 2×2 gold-border variant |
| 3 | _Stacked headline “Innovation. Transformation. Glass Packaging.” plus body and gold Read Our Story_ | Hero Banner | OI | High | Live site sits this beside the news grid |
| 4 | _3-slide carousel (Vision / Innovation / Sustainability Mission) with gold circular CTA and dots_ | Carousel | OI | High | Re-wire existing Carousel; create Headless Variants container |
| 5 | _Power of Glass — amber bottle photo left, copy right, giant OI watermark_ | Promo CTA | OIImageLeft | High | Re-wire second Promo CTA |
| 6 | _Guided by Our Values — overlapping circular photos left, copy and See Our Careers pill right_ | Promo CTA | OIValues | Medium | One Image field; extra circles are variant chrome |
| 7 | _Stay Connected gold-outlined box with email field and Submit_ | Heading CTA | OINewsletter | Medium | No newsletter component in Financial library |
| 8 | _Dark multi-column footer with logo, link groups, socials, copyright_ | Footer | OI | High | Context-only, footer partial |

---

## Sections that need attention

> [!WARNING]
> Review these before approving — layout or fields are a stretch vs the screenshot.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 2+3 | _News grid and hero copy sit 50/50 on desktop_ | Two components will stack in `headless-main` | Pixel-perfect: Hero Banner OI uses its `hero-banner` placeholder so the news grid sits on the left |
| 4 | _Carousel Item has no Eyebrow field_ | Gold “OUR MISSION” label is not a dedicated field | First `<p>` in Text is styled as the gold uppercase eyebrow |
| 6 | _Several overlapping circular photos_ | Promo CTA has a single Image field | Variant can collage one photo + CSS circles; extra assets stay decorative |
| 7 | _Real email subscribe field_ | Heading CTA has no email field | Variant draws presentational input + Submit; not a live form |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | OI | Dark bar + gold pill Catalog CTA, not the light banking header |
| 2 | Four Column CTA | OINewsGrid | 2×2 gold-border news tiles instead of a 4-up column row |
| 3 | Hero Banner | OI | Text-only dark hero, no dotted banking image column |
| 4 | Carousel | OI | Dark split slides, gold circular badge, dots only |
| 5 | Promo CTA | OIImageLeft | Image-left plus oversized OI watermark |
| 6 | Promo CTA | OIValues | Circular photo cluster |
| 7 | Heading CTA | OINewsletter | Gold-bordered subscribe card |
| 8 | Footer | OI | Dark columns + gold accents |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Four Column CTA | Simple (1 item, 4 image/title/link slots) |
| 3 | Hero Banner | Simple (1 item) |
| 4 | Carousel | List (parent + 3 Carousel Item children) — re-wire existing |
| 5 | Promo CTA | Simple (1 item) — re-wire existing |
| 6 | Promo CTA | Simple (1 item) — re-wire existing |
| 7 | Heading CTA | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Select OI variant; logo image |
| 8 | Footer | Footer partial design | Assign O-I Footer datasource + OI variant |

### Custom components needed

None — all sections matched Financial template components.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/manufacturing/o-i/Data):
  1. FourColumnCta (news grid)
  2. HeroBanner
  3. Carousel (Vision / Innovation / Mission) — re-wire existing
  4. PromoCta (Power of Glass)
  5. PromoCta (Guided by Our Values)
  6. HeadingCta (Stay Connected)
  7. Footer (context-only)

Phase 2 — Apply theme (CSS variables + Lato in globals.scss)

Phase 3 — Custom components: none

Phase 5.5 — Pixel-perfect OI variants (required)

Home leftovers to delete manually after assembly:
  Promo CTA leftover (Home/Data Promo CTA 1), Five Column CTA, Three Column CTA,
  Two Column CTA, Article List, Documents List, App Promo
```

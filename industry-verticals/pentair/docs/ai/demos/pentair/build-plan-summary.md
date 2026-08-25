# Pentair — Build Plan

> **Source:** https://www.pentair.com/
> **Analyzed:** 2026-08-25
> **Sections:** 10 (10 template, 0 custom)
> **Environment:** `/sitecore/content/manufacturing/pentair` · code in `industry-verticals/pentair`

This site uses the **Financial starter kit** (same pattern as the Quanex manufacturing demo). The uiim template library from the skill catalog is not deployed here, so every section is mapped to a rendering that already exists on this site.

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | *White bar with Pentair logo, utility icons, mega-menu (Products, Solutions, Education, Sustainability, About, Investors) and search* | Header | WithLogoImage → **Pentair** | High | Partial design — manual |
| 2 | *Full-bleed alpine lake photo with white uppercase overlay “We help the world sustainably move, improve and enjoy water” and a green Learn More button* | Hero Banner | **Pentair** | High | Triangle flourish is CSS |
| 3 | *Three full-bleed photo tiles: Move Water / Improve Water / Enjoy Water* | Three Column CTA | **PentairPillars** | High | Overlay tiles, not stacked cards |
| 4 | *“Sustainability Spotlight” — three cards (2025 report, BIG Innovation award, IBD Top 50)* | Three Column CTA | **PentairSpotlight** | High | Second instance |
| 5 | *Careers split: “A Purpose Driven Company” copy on the left, team photo on the right* | Promo CTA | **PentairCareers** | High | |
| 6 | *Innovation: mySüdmo app — text left, tablet screenshot right* | Promo CTA | **PentairInnovation** | High | |
| 7 | *Innovation: Everpure / Manitowoc awards — image left, text right* | Promo CTA | **PentairInnovationAlt** | High | Flipped layout |
| 8 | *Innovation: IntelliFlo3 pump of the year — text left, product photo right* | Promo CTA | **PentairInnovation** | High | |
| 9 | *Minimal “News Releases” heading plus featured Q2 2026 earnings blurb and View All* | Heading CTA | **PentairNews** | Medium | No dedicated news list in the kit |
| 10 | *Navy mega-footer with logo, mission copy, four link columns, social icons, copyright* | Footer | **Pentair** | High | Partial design — manual |

---

## Sections that need attention

> [!NOTE]
> All sections matched with medium or high confidence. No new Sitecore component types are required. Pixel-perfect look depends on **Phase 5.5 custom variants** (see question 2 below).

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 9 | *News list with dates and pagination* | Heading CTA only holds one featured story | Good enough for a homepage demo; add a second Heading CTA if you want two stories |
| 3–4 | *Two Three Column CTAs* | Default variant is image-above-title cards, not overlay tiles / image-top editorial cards | Custom variants `PentairPillars` and `PentairSpotlight` |
| 1 | *Two-row mega-menu* | Header is a placeholder shell today | Style + datasource in the Header partial |

Live pentair.com copy is **2025/2026** (screenshot showed 2023). After you approve, Phase 2.5 will pull current text and images from the URL.

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | Pentair (from WithLogoImage) | Solid white bar, not a transparent overlay. Mega-menu is extra. |
| 2 | Hero Banner | Pentair | Full-bleed photo + overlay type. Default Hero Banner is a split/accent layout. |
| 3 | Three Column CTA | PentairPillars | Full-bleed image tiles with white overlay titles, not cards with images on top. |
| 4 | Three Column CTA | PentairSpotlight | Image-top editorial cards + gray section heading + green text links. |
| 5 | Promo CTA | PentairCareers | Muted band, condensed navy headline, green text link (not a filled button). |
| 6, 8 | Promo CTA | PentairInnovation | Text/image split with condensed uppercase titles. |
| 7 | Promo CTA | PentairInnovationAlt | Same as above, image on the left. |
| 9 | Heading CTA | PentairNews | Gray NEWS RELEASES eyebrow, no large button. |
| 10 | Footer | Pentair | Navy background, white type, mission blurb + four columns. |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero Banner | Simple (1 item) |
| 3 | Three Column CTA | Simple (1 item, 3 image/text/link slots) |
| 4 | Three Column CTA | Simple (1 item, 3 image/text/link slots) |
| 5 | Promo CTA | Simple (1 item) — Careers |
| 6 | Promo CTA | Simple (1 item) — mySüdmo |
| 7 | Promo CTA | Simple (1 item) — Everpure |
| 8 | Promo CTA | Simple (1 item) — IntelliFlo3 |
| 9 | Heading CTA | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Assign Pentair logo + restyle mega-menu |
| 10 | Footer | Footer partial design | Assign Pentair logo, columns, socials |

### Custom components needed

None — all sections matched starter-kit components. Pixel-perfect matching is **custom variants**, not new templates.

---

## Theme (extracted — awaiting approval)

| Token | Value |
|-------|--------|
| Primary (navy) | `#09244F` |
| Secondary (teal) | `#006E96` |
| Accent (leaf green) | `#4F8309` |
| CTA green | `#6EB70B` |
| Footer | `#09244F` |
| Headings | Barlow Condensed 300, uppercase |
| Body | Barlow 400 |
| Buttons | 0px radius (sharp rectangles) |

Google Fonts: Barlow + Barlow Condensed (no substitution).

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/manufacturing/pentair/Data):
  1. HeroBanner          — Pentair - Hero Banner
  2. ThreeColumnCta      — Pentair - Move Improve Enjoy
  3. ThreeColumnCta      — Pentair - Sustainability Spotlight
  4. PromoCta            — Pentair - Careers
  5. PromoCta            — Pentair - Innovation mySudmo
  6. PromoCta            — Pentair - Innovation Everpure
  7. PromoCta            — Pentair - Innovation IntelliFlo3
  8. HeadingCta          — Pentair - News Releases

Phase 2 — Apply theme (CSS variables + Barlow fonts in industry-verticals/pentair)

Phase 3 — Custom components: none

Phase 5.5 — Pentair variants (if you want pixel-perfect)

Phase 6 — Assemble on the existing Home page
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** for each section (Phase 5.5), or are the generic starter-kit variants plus brand colors enough?

> Reply **approved** to proceed, or describe any changes needed.

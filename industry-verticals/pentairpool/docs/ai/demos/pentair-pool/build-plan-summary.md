# Pentair Pool — Build Plan

> **Source:** https://www.pentair.com/en-us/pool-spa.html
> **Analyzed:** 2026-08-25
> **Sections:** 20 (20 template, 0 custom)
> **Environment:** `/sitecore/content/pentair/pentairpool` · code in `industry-verticals/pentairpool`

This site uses the **Financial starter kit** (same pattern as the Quanex and corporate Pentair demos). The uiim template library from the skill catalog is not deployed here, so every section is mapped to a rendering that already exists on this site.

Visual structure follows the attached screenshot. Live homepage copy (2026) will be locked in Phase 2.5 where it differs.

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | *White bar with Pentair Pool logo, utility icons, Products / Education / Support, and search* | Header | WithLogoImage → **PentairPool** | High | Partial design — manual |
| 2 | *Full-bleed rippling pool water with centered white “Your Trusted Source for All Things Pool”* | Hero Banner | **PentairPool** | High | Overlay, not split |
| 3 | *Centered navy intro: “We help the world safely and sustainably enjoy water…”* | Heading CTA | Centered → **PentairPoolIntro** | High | Text only |
| 4 | *Four featured product cards (IntelliCenter, MasterTemp, IntelliFlo3, IntelliConnect) with green Learn More* | Four Column CTA | **PentairPoolProducts** | High | Live titles may differ |
| 5 | *Two light-blue tiles: professional portal vs new pool owner resources* | Two Column CTA | **PentairPoolPersonas** | High | |
| 6 | *Five icon links: rebates, warranties, registration, calculators, find a pro* | Five Column CTA | **PentairPoolResources** | High | Icon row |
| 7 | *Teal “Pool Solutions” band with a short intro paragraph* | Heading CTA | **PentairPoolSolutionsHead** | Medium | Band is CSS |
| 8 | *Pumps — “Pump up the Flow”, lifestyle + product, two green CTAs* | Promo CTA | **PentairPoolSplit** | High | |
| 9 | *Automation — “Control at Your Fingertips”, image left* | Promo CTA | **PentairPoolSplitAlt** | High | Flipped |
| 10 | *Lighting — “Illuminated & Dazzling Ambience”* | Promo CTA | **PentairPoolSplit** | High | |
| 11 | *Filtration & cleaning — “Clearer and Dive-in Ready”* | Promo CTA | **PentairPoolSplitAlt** | High | Flipped |
| 12 | *Heating — “Heat It Up”* | Promo CTA | **PentairPoolSplit** | High | |
| 13 | *Water treatment — “Cleaner, Clearer, and Silkier Water”* | Promo CTA | **PentairPoolSplitAlt** | High | |
| 14 | *More Pool Products icons — first four categories* | Four Column CTA | **PentairPoolIcons** | High | Second instance |
| 15 | *More Pool Products icons — second four categories* | Four Column CTA | **PentairPoolIcons** | High | Third instance |
| 16 | *Two rebate / partner tiles with green Learn More* | Two Column CTA | **PentairPoolPartners** | Medium | Screenshot showed ENERGY STAR + PoolPro |
| 17 | *Green “Understand Your Pool Equipment” banner with lifestyle photo* | CTA Banner | LargeImage → **PentairPoolEdu** | High | |
| 18 | *Navy “Need equipment or service?” / Find a Dealer band* | CTA Banner | **PentairPoolDealer** | High | |
| 19 | *Pentair Pool App — phone mockup + download copy* | App Promo | **PentairPoolApp** | High | No native Link field |
| 20 | *Navy mega-footer with logo, mission, four columns, socials, copyright* | Footer | **PentairPool** | High | Partial design — manual |

---

## Sections that need attention

> [!NOTE]
> All sections matched with medium or high confidence. No new Sitecore component types are required. Pixel-perfect look depends on **Phase 5.5 custom variants** (see question 2 below).

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 4 | *Featured product set* | Screenshot products may not match the live automated-family row | Phase 2.5 will lock live titles, images, and links |
| 7 | *Teal Pool Solutions band* | Heading CTA has no image field | Variant CSS for the band; switch to CTA Banner if you want an authored photo |
| 16 | *Partner badges vs rebates* | Screenshot showed ENERGY STAR + PoolPro; live site currently shows rebate tiles | Approve either; Phase 2.5 follows the live page unless you say otherwise |
| 19 | *App download button* | App Promo has Title / Text / Image only | CTA goes in Rich Text, or we switch this section to Promo CTA |
| 20 | *Stay Up to Date / Product Registration bar* | Visible on the attached screenshot, not a separate kit component | Can add a Two Column CTA after approval, or leave it out of v1 |

Six Promo CTA instances (8–13) reuse two variants (`PentairPoolSplit` / `PentairPoolSplitAlt`). That is expected — the live page is a long alternating category stack.

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | PentairPool (from WithLogoImage) | Solid white bar, Pentair Pool lockup, three-item nav — not a transparent overlay |
| 2 | Hero Banner | PentairPool | Full-bleed water photo + centered overlay. Default Hero Banner is a split/accent layout |
| 3 | Heading CTA | PentairPoolIntro | Centered condensed navy intro, no button |
| 4 | Four Column CTA | PentairPoolProducts | Image-top product cards + sharp green Learn More |
| 5 | Two Column CTA | PentairPoolPersonas | Light-blue persona tiles |
| 6 | Five Column CTA | PentairPoolResources | Compact teal icon row, not five fat cards |
| 7 | Heading CTA | PentairPoolSolutionsHead | Teal/navy section band |
| 8, 10, 12 | Promo CTA | PentairPoolSplit | Text left / image right category blocks |
| 9, 11, 13 | Promo CTA | PentairPoolSplitAlt | Flipped image-left versions |
| 14–15 | Four Column CTA | PentairPoolIcons | Icon+label tiles for More Pool Products |
| 16 | Two Column CTA | PentairPoolPartners | Badge/rebate tiles, not persona tiles |
| 17 | CTA Banner | PentairPoolEdu | Green educational band with photo |
| 18 | CTA Banner | PentairPoolDealer | Navy centered Find a Dealer |
| 19 | App Promo | PentairPoolApp | Large phone mockup, condensed type, green CTA |
| 20 | Footer | PentairPool | Navy, white type, four columns |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero Banner | Simple (1 item) |
| 3 | Heading CTA | Simple (1 item) — Intro |
| 4 | Four Column CTA | Simple (1 item, 4 slots) — Featured products |
| 5 | Two Column CTA | Simple (1 item) — Personas |
| 6 | Five Column CTA | Simple (1 item, 5 slots) — Resources |
| 7 | Heading CTA | Simple (1 item) — Pool Solutions heading |
| 8–13 | Promo CTA × 6 | Simple (1 item each) — Pumps, Automation, Lighting, Filtration, Heating, Treatment |
| 14–15 | Four Column CTA × 2 | Simple (1 item each) — More products rows |
| 16 | Two Column CTA | Simple (1 item) — Rebates / partners |
| 17 | CTA Banner | Simple (1 item) — Understand equipment |
| 18 | CTA Banner | Simple (1 item) — Find a dealer |
| 19 | App Promo | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Assign Pentair Pool logo + restyle utility / mega-menu |
| 20 | Footer | Footer partial design | Assign logo, columns, socials, copyright |

### Custom components needed

None — all sections matched starter-kit components. Pixel-perfect matching is **custom variants**, not new templates.

---

## Theme (approved)

| Token | Value |
|-------|--------|
| Primary (navy) | `#09244F` |
| Secondary (teal) | `#006E96` |
| Accent (leaf green) | `#4F8309` |
| Footer | `#09244F` |
| Headings | Barlow Condensed 300, uppercase |
| Body | Barlow 400 |
| Buttons | 0px radius (sharp rectangles) |

Google Fonts: Barlow + Barlow Condensed (no substitution).

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/pentair/pentairpool/Data):
  1.  HeroBanner       — Pentair Pool - Hero Banner
  2.  HeadingCta       — Pentair Pool - Intro
  3.  FourColumnCta    — Pentair Pool - Featured Products
  4.  TwoColumnCta     — Pentair Pool - Personas
  5.  FiveColumnCta    — Pentair Pool - Resources
  6.  HeadingCta       — Pentair Pool - Solutions Heading
  7.  PromoCta         — Pentair Pool - Pumps
  8.  PromoCta         — Pentair Pool - Automation
  9.  PromoCta         — Pentair Pool - Lighting
  10. PromoCta         — Pentair Pool - Filtration
  11. PromoCta         — Pentair Pool - Heating
  12. PromoCta         — Pentair Pool - Treatment
  13. FourColumnCta    — Pentair Pool - More Products 1
  14. FourColumnCta    — Pentair Pool - More Products 2
  15. TwoColumnCta     — Pentair Pool - Rebates
  16. CtaBanner        — Pentair Pool - Understand Equipment
  17. CtaBanner        — Pentair Pool - Find a Dealer
  18. AppPromo         — Pentair Pool - App

Phase 2 — Apply theme (CSS variables + Barlow fonts in industry-verticals/pentairpool)

Phase 3 — Custom components: none

Phase 5.5 — Pentair Pool variants (if you want pixel-perfect)

Phase 6 — Assemble on the existing Home page
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** for each section (Phase 5.5), or are the generic starter-kit variants plus brand colors enough?

> Reply **approved** to proceed, or describe any changes needed.

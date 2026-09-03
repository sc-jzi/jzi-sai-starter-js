# Covista — Demo Build Summary

> **Client:** Covista
> **Source:** https://www.covista.com
> **Built:** 2026-09-03
> **Page:** `/sitecore/content/covista/covista/Home`

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | 10 (PLAY! Financial) |
| Custom components built | 0 |
| Custom variants created | 11 named exports + Sitecore definitions |
| Datasource items created | 12 under Promos + Home/Data fallbacks |
| Images uploaded | 15 / 15 |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | Header | Covista | Header partial | ⚠️ Needs variant |
| 2 | Carousel | Covista | Covista - Hero Carousel | ⚠️ Needs datasource + variant |
| 3 | StatsCounter | CovistaCards | Covista_Stats / Covista - Stats | ⚠️ Confirm on page |
| 4 | PromoCta | CovistaResearch | Promo CTA 1 (research copy) | ⚠️ Needs variant |
| 5 | HeadingCta | Covista | Covista_Institutions_Heading | ⚠️ Confirm on page |
| 6 | FiveColumnCta | CovistaLogos | Covista - Institutions | ⚠️ Rewire + variant |
| 7 | HeadingCta | CovistaLink | Covista_Institutions_Learn_More | ⚠️ Confirm on page |
| 8 | PromoCta | CovistaSplit | Covista - Support | ✅ Wired, ⚠️ variant |
| 9 | PromoCta | CovistaSplitReverse | Covista - Careers | ✅ Wired, ⚠️ variant |
| 10 | CtaBanner | CovistaStock | Covista_Stock | ✅ On page + variant |
| 11 | HeadingCta | Covista | Covista_News_Heading | ⚠️ Confirm on page |
| 12 | FourColumnCta | CovistaStories | Covista - News Stories | ✅ Wired + variant |
| 13 | HeadingCta | CovistaLink | More stories | ⚠️ Confirm on page |
| 14 | Footer | Covista | Footer 1 | ⚠️ Needs variant |

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `#1B4929` |
| Accent | `#D96941` |
| Heading font | Josefin Slab |
| Body font | Source Sans 3 |
| Delivery method | sass |
| Google Fonts | Added in `_fonts.scss` |

Site class: `site-covista` (mapped from site name `covista` / `Covista`).

---

## Image Upload Summary

**Content Hub:** `https://covista.sitecoresandbox.cloud`

| Result | Count |
|--------|-------|
| Uploaded + approved | 15 |
| Failed | 0 |
| **Total** | **15** |

---

## Next Steps

1. Restart the covista rendering host.
2. Complete `variant-checklist.md` (~8 minutes).
3. Complete `manual-tasks.md` (carousel rewire, leftover PLAY! cleanup, nav labels).
4. Optional: assign hero MP4 on the carousel slide.

## Files

- Theme: `docs/ai/themes/covista.theme.yaml`
- Plan: `docs/ai/demos/covista/build-plan.yaml`
- Content map: `docs/ai/demos/covista/content-map.yaml`
- Progress: `docs/ai/demos/covista/demo-progress.yaml`

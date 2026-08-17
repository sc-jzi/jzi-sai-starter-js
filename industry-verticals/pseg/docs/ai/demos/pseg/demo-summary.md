# PSEG — Demo Build Summary

> **Client:** PSEG (PSE&G)
> **Source:** https://nj.pseg.com/
> **Built:** 2026-08-17
> **Page:** `/sitecore/content/utilities/pseg/Home`

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | 10 (Header + Footer are partials) |
| Custom components built | 0 |
| Custom variants created | 12 |
| Datasource items created | 10 parents + 3 carousel slides |
| Fields populated | Text/links populated; images pending DAM |
| Images uploaded | 13 / 13 (Content Hub approved) |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | Header | Pseg | _partial_ | ⚠️ Set variant on Header partial |
| 2 | Carousel | Pseg | PSEG - Hero Carousel | ⚠️ Needs datasource + variant |
| 3 | FourColumnCta | PsegQuickLinks | PSEG - Quick Links | ⚠️ Needs datasource + variant |
| 4 | TwoColumnCta | PsegAccountCards | PSEG - Account Cards | ⚠️ Needs datasource + variant |
| 5 | PromoCta | PsegBusiness | PSEG - Business Needs | ⚠️ Needs datasource + variant |
| 6 | HeadingCta | Pseg | PSEG - WorryFree Intro | ⚠️ Add to page |
| 7 | ThreeColumnCta | PsegWorryFree | PSEG - WorryFree Services | ⚠️ Needs datasource + variant |
| 8 | CtaBanner | PsegAppointment | PSEG - Make an Appointment | ⚠️ Add to page |
| 9 | PromoCta | PsegSavings | PSEG - Energy Savings | ⚠️ Needs datasource + variant |
| 10 | PromoCta | PsegCommunity | PSEG - Powering the Future | ⚠️ Needs datasource + variant |
| 11 | PromoCta | PsegStorm | PSEG - Storm Preparation | ⚠️ Add to page |
| 12 | Footer | Pseg | _partial_ | ⚠️ Set variant on Footer partial |

<!-- STATUS KEY: ✅ Wired | ✅ On page | ⚠️ Needs variant | ⚠️ Needs datasource | ❌ Failed -->

Datasources and variant definitions exist in Sitecore. Wiring failed via Agent API (HTTP 500) — same limitation as Quanex/Huron. Use `manual-tasks.md`.

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `#002F6C` |
| Accent | `#F37022` |
| Footer | `#001F3D` |
| Heading font | Source Sans 3 |
| Body font | Source Sans 3 |
| Delivery method | `src/assets/pseg/colors.css` imported from `globals.scss` + `site-pseg` class |
| Google Fonts | Already loaded by Financial starter (`Source Sans 3`) |

Site name `pseg` maps to `site-pseg` in `src/lib/site-theme.ts`. Restart the rendering host after pull.

---

## Image Upload Summary

**Content Hub:** `https://jzi-verticals.sitecoresandbox.cloud` — **13/13 uploaded and approved**

| Result | Count |
|--------|-------|
| Uploaded + approved | 13 |
| Failed | 0 |
| Local fallbacks | 13 in `public/pseg/` (still used if DAM src is empty) |

See `images/image-manifest.json` for public URLs. Variants still fall back to `/pseg/<file>.jpg` if a field has no `src`.

---

## Manual Tasks

Work through `manual-tasks.md` and `variant-checklist.md` in this order:

1. Set Home Title to PSEG
2. Rewire existing Home components to the PSEG datasources
3. Add Heading CTA, CTA Banner, and the Storm Promo CTA
4. Select the Pseg* variants (including Header/Footer partials)
5. Remove PLAY! leftovers (Comparison, Five Column CTA, Article List, Documents List, App Promo)
6. Images are already in Content Hub — no DAM upload needed

---

## Output Files

All under `docs/ai/demos/pseg/`.

| File | What it contains |
|------|-----------------|
| `demo-progress.yaml` | Phase tracker |
| `build-plan.yaml` | Section → component map |
| `content-map.yaml` | Field values + datasource IDs |
| `variant-specs.yaml` | Pixel-perfect layout notes |
| `variant-checklist.md` | Pages variant dropdown IDs |
| `manual-tasks.md` | Assembly checklist |
| `images-to-upload.md` | DAM retry list |
| `images/` | Source photography |

> **Quick test:** Restart `industry-verticals/pseg`, open the PSEG site, then finish `manual-tasks.md`. You should see navy/orange, Source Sans 3, and the custom layouts even before DAM images are linked.

# Walden University — Demo Build Summary

> **Client:** Walden University
> **Source:** https://www.waldenu.edu/
> **Built:** 2026-09-03
> **Page:** `/sitecore/content/covista/walden/Home`

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | 16 |
| Custom components built | 0 |
| Custom variants created | 16 |
| Datasource items created | 13 (+ 4 FAQ children) |
| Fields populated | 62 |
| Images uploaded | 7 / 7 mapped |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | Eyebrow | Walden | _partial_ | ⚠️ Set variant on partial |
| 2 | Header | Walden | _partial_ | ⚠️ Set variant + logo |
| 3 | Hero | Walden | Walden University - Hero | ⚠️ Add on page |
| 4 | Four Column CTA | WaldenProgramFinder | Walden University - Program Finder | ⚠️ Add on page |
| 5 | Features | Walden | Walden University - Foundation for Impact | ⚠️ Add on page |
| 6 | Promo CTA | Walden | Walden University - AI Certificates | ⚠️ Add on page |
| 7 | Promo CTA | WaldenEducation | Walden University - Education Options | ⚠️ Add on page |
| 8 | Heading CTA | Walden | Walden University - Graduation Path | ⚠️ Add on page |
| 9 | Promo CTA | WaldenQuality | Walden University - Quality Matters | ⚠️ Add on page |
| 10 | Four Column CTA | WaldenInterestGrid | Walden University - Areas of Interest | ⚠️ Add on page |
| 11 | Quote | Walden | Walden University - Alumni Quote | ⚠️ Add on page |
| 12 | Promo CTA | WaldenGoals | Walden University - Goals Within Reach | ⚠️ Add on page |
| 13 | CTA Banner | WaldenTrust | Walden University - B Corp | ⚠️ Add on page |
| 14 | Promo CTA | WaldenLinkCard | Walden University - Whats Next | ⚠️ Add on page |
| 15 | Accordion | Walden | Walden University - FAQ | ⚠️ Add on page |
| 16 | Footer | Walden | _partial_ | ⚠️ Set variant on partial |

> Home layout API returned HTTP 500 (`editablePlaceholders` empty). Datasources and variants are created; page assembly must be finished in Pages. See `manual-tasks.md`.

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `#00334C` |
| Secondary | `#00467F` |
| Accent | `#FFC72C` (navy text on gold pills) |
| Heading font | Noto Serif 700 |
| Body font | Mulish 400 |
| Delivery method | globals-inlined (`src/app/globals.scss` + Financial tokens) |
| Google Fonts | Added in `layout.tsx` |

---

## Image Upload Summary

**Content Hub:** `https://covista.sitecoresandbox.cloud/`

| Result | Count |
|--------|-------|
| Uploaded + approved | 7 |
| Failed | 0 |
| **Mapped total** | **7** |

| # | File | Section | Asset ID | Public URL | Dimensions |
|---|------|---------|----------|------------|------------|
| 1 | section3-img4.jpg | AI Certificates | 84024 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84024-section3-img4?v=15e14c0f) | 510 x 542 |
| 2 | section5-img7.jpg | Education Options | 84029 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84029-section5-img7?v=ab70498b) | 632 x 632 |
| 3 | section7-img24.jpg | Quality Matters | 84034 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84034-section7-img24?v=34d0e07f) | 600 x 450 |
| 4 | section9-img45.jpg | Alumni Quote | 84045 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84045-section9-img45?v=9d343013) | 632 x 454 |
| 5 | section10-img53.jpg | Goals Within Reach | 84055 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84055-section10-img53?v=596d8bda) | 632 x 632 |
| 6 | section11-img69.png | B Corp | 84063 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84063-section11-img69?v=4db67dbc) | 572 x 754 |
| 7 | section12-img81.jpg | What’s Next | 84070 | [link](https://covista.sitecoresandbox.cloud/api/public/content/84070-section12-img81?v=648055f5) | 740 x 602 |

Hero source photo was not in the DOM extract — add manually.

---

## Pixel-perfect variants

All 16 sections have a dedicated layout (not generic Financial chrome):

- Full-bleed hero with gold ribbon + degree dropdowns
- Dark teal program finder overlapping the hero
- Mission + 3 icon highlights
- Distinct Promo CTA treatments for AI, Tempo, Quality Matters, Goals, and What’s Next
- Dark teal conversion and B Corp bars
- Interest grid without large photos
- Photo + overlapping alumni quote
- Navy FAQ accordion
- Restyled header, utility bar, and footer

---

## Next step

Open `manual-tasks.md` and assemble Home in Pages. Restart `npm run dev` in `industry-verticals/walden` so the new named exports are available.

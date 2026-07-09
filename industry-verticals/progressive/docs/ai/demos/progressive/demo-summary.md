# Progressive Insurance — Demo Summary

## Build Overview

| Metric | Count |
|--------|-------|
| Template components | 7 |
| Custom components | 0 |
| Custom variants | 8 |
| Datasources created | 7 |
| Images uploaded | 17/17 |
| Page assembly | Manual required |

**Source:** [progressive.com](https://www.progressive.com/)
**Site:** Financial / ProsperaFinancial
**Theme:** Progressive brand tokens in `src/assets/progressive/`

---

## Component Inventory

| # | Section | Component | Variant | Datasource | Status |
|---|---------|-----------|---------|------------|--------|
| — | Header | Header | **Progressive** | (partial design) | Variant ready |
| 1 | Hero | Hero | **Progressive** | Progressive - Hero | Content + variant ready |
| 2 | Quote products | Four Column CTA | **ProgressiveQuote** | Progressive - Quote Products | Content + variant ready |
| 3 | Trust intro | Heading CTA | **Progressive** | Progressive - Trust Intro | Content + variant ready |
| 4 | Stats | Stats Counter | **Progressive** | Progressive - Stats | Content + variant ready |
| 5 | Products | Features | **Progressive** | Progressive - Products | Content + variant ready |
| 6 | Why intro | Heading CTA | **Progressive** | Progressive - Why Intro | Content + variant ready |
| 7 | Why tiles | Four Column CTA | **ProgressiveTiles** | Progressive - Why Progressive | Content + variant ready |
| — | Footer | Footer | **Progressive** | (partial design) | Variant ready |

---

## Pixel-Perfect Variants

Custom TSX exports and SCSS in `src/assets/sass/components/_progressive-demo.scss`:

| Component | Variant | Sitecore path |
|-----------|---------|---------------|
| Header | Progressive | `/Presentation/Headless Variants/Header/Progressive` |
| Hero | Progressive | `/Presentation/Headless Variants/Hero/Progressive` |
| FourColumnCta | ProgressiveQuote | `/Presentation/Headless Variants/FourColumnCta/ProgressiveQuote` |
| FourColumnCta | ProgressiveTiles | `/Presentation/Headless Variants/FourColumnCta/ProgressiveTiles` |
| HeadingCta | Progressive | `/Presentation/Headless Variants/HeadingCta/Progressive` |
| StatsCounter | Progressive | `/Presentation/Headless Variants/StatsCounter/Progressive` |
| Features | Progressive | `/Presentation/Headless Variants/Features/Progressive` |
| Footer | Progressive | `/Presentation/Headless Variants/Footer/Progressive` |

---

## Theme

| Token | Value |
|-------|-------|
| Primary | `#003DA5` (Progressive navy) |
| Secondary | `#0077B3` (action blue) |
| Accent | `#FFFF00` (Progressive yellow) |
| Font | 96 Sans → Arial fallback |
| Card style | Bordered, no shadow |

Theme file: `docs/ai/themes/progressive.theme.yaml`
Applied via: `src/assets/progressive/colors.css`, `typography.css`, etc.

---

## Image Upload Summary

> All 17 images uploaded and approved to Content Hub (`jzi-verticals.sitecoresandbox.cloud`).

| File | Section | Asset ID |
|------|---------|----------|
| section1-img6.jpg | Hero background | 95143 |
| section1-img1–4.svg | Quote product icons | 95108–95129 |
| section5-img7.svg | Products illustration | 95155 |
| section7-img8–11.jpg | Why Progressive tiles | 95163–95192 |

---

## Manual Tasks

See [manual-tasks.md](./manual-tasks.md) for step-by-step Pages editor assembly.
See [variant-checklist.md](./variant-checklist.md) for variant selection per component.

**Quick steps:**
1. Open Home page in Pages editor
2. Add 7 components in order (Hero → Four Column CTA → Heading CTA → Stats Counter → Features → Heading CTA → Four Column CTA)
3. Wire each to its Progressive datasource
4. Set each component variant per variant-checklist.md
5. Update Header/Footer partial designs — set **Progressive** variant and update nav/footer links
6. Run `npm run dev` to preview

---

## Files

```
docs/ai/demos/progressive/
├── build-plan.yaml
├── build-plan-summary.md
├── content-map.yaml
├── demo-progress.yaml
├── demo-summary.md          ← this file
├── manual-tasks.md
├── variant-checklist.md
├── variant-specs.yaml
├── extracted-content.json
└── images/
    └── image-manifest.json
```

# Wake Forest University — Demo Summary

> **Source:** https://www.wfu.edu/
> **Sitecore:** Financial / ProsperaFinancial
> **Status:** Partial — theme + variants + datasources complete; page assembly blocked

---

## Build Overview

| Item | Count |
|------|-------|
| Template components (Financial vertical) | 9 mapped |
| Custom variants created (TSX) | 4 components |
| Datasource items created | 4 |
| Images uploaded | 0 / 16 (Content Hub auth expired) |
| Page components wired | 0 (API blocked) |

---

## What was completed

### Environment
- Updated `project.yaml` to `Financial` / `ProsperaFinancial`
- Updated manifest content paths from `main/main-website` → `Financial/ProsperaFinancial`

### Theme (Phase 4)
- Wake Forest gold/black palette applied to `src/assets/progressive/colors.css`
- Cormorant + Open Sans fonts in `src/assets/progressive/typography.css`
- Google Fonts import added to `src/app/globals.scss`

### Pixel-perfect variants (Phase 5.5)
| Component | Variant export | Purpose |
|-----------|---------------|---------|
| Hero | `WakeForest` | Centered serif headline over full-bleed image |
| ThreeColumnCta | `WakeForest` | Gold rectangular CTA button row |
| TwoColumnCta | `WakeForest` | Dark panel + image split (Wake Up section) |
| TwoColumnCta | `WakeForestMotto` | Seal image + motto text |

SCSS: `src/assets/sass/components/_component-wake-forest.scss`

### Content extraction (Phase 2.5)
- `extracted-content.json` — 12 sections, 16 images downloaded locally
- 10 Instagram images failed (HTTP 403)

### Datasource items created (Phase 3)

| Item | Path | Item ID |
|------|------|---------|
| Wake Forest - Hero | `/Data/Promos/Wake Forest - Hero` | `{6fe837e5-0fed-439d-8df5-15fa04745518}` |
| Wake Forest - Hero CTAs | `/Data/Promos/Three Column CTA/Wake Forest - Hero CTAs` | `{adeabf81-2ac9-4f96-8fa4-700a78534ba4}` |
| Wake Forest - Wake Up | `/Data/Promos/Two Column CTA/Wake Forest - Wake Up` | `{9237fb3a-b67c-4b1d-b7fd-abc6ac9b0f06}` |
| Wake Forest - Motto | `/Data/Promos/Two Column CTA/Wake Forest - Motto` | `{d79ec09a-0390-4800-b930-43df8f355a69}` |

---

## Blockers

### 1. Content Hub credentials expired
Password for `jzi-verticals.sitecoresandbox.cloud` is expired. Image fields are empty on datasource items.

**Fix:** Update `docs/ai/config/credentials.local.yaml`, then run:
```bash
node docs/ai/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/wake-forest/images
```

### 2. Page assembly API unavailable
`get_components_on_page` and `add_component_on_page` return 404/500 for the Home page. Manual assembly required in Pages editor.

### 3. Component library mismatch
The build plan targeted **uiim** template components (`FeatureHighlight`, `FeatureCardsGrid`, etc.) which are **not deployed** in ProsperaFinancial. Demo was adapted to **Financial vertical** components (`Hero`, `ThreeColumnCta`, `TwoColumnCta`, etc.).

---

## Manual Tasks

See `manual-tasks.md` and `variant-checklist.md` for step-by-step Pages editor instructions.

---

## Files

```
docs/ai/demos/wake-forest/
├── demo-progress.yaml
├── build-plan.yaml
├── build-plan-summary.md
├── demo-summary.md          ← this file
├── manual-tasks.md
├── variant-checklist.md
├── extracted-content.json
└── images/                  ← 16 local images ready for upload
```

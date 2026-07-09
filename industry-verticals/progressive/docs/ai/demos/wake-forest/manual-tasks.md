# Wake Forest Demo — Manual Tasks

## 1. Fix Content Hub credentials

Update `docs/ai/config/credentials.local.yaml` with a valid password for `jzi-verticals.sitecoresandbox.cloud`, then upload images:

```bash
node docs/ai/scripts/upload-to-content-hub.mjs --images-dir docs/ai/demos/wake-forest/images
```

After upload, set Image fields on datasource items (see `images-to-upload.md`).

---

## 2. Register WakeForest variants in Sitecore

Create Variant Definition items under `/sitecore/content/Financial/ProsperaFinancial/Presentation/Headless Variants/`:

| Component | Variant name | TSX export |
|-----------|-------------|------------|
| Hero | WakeForest | `WakeForest` |
| Three Column CTA | WakeForest | `WakeForest` |
| Two Column CTA | WakeForest | `WakeForest` |
| Two Column CTA | WakeForestMotto | `WakeForestMotto` |

If variant containers don't exist for these components, create a **Headless Variants** container item first (name must match rendering name).

---

## 3. Assemble Home page in Pages editor

Open `/sitecore/content/Financial/ProsperaFinancial/Home` in Pages editor.

Add components top-to-bottom in `headless-main`:

| # | Rendering | Datasource | Variant |
|---|-----------|------------|---------|
| 1 | Hero | Wake Forest - Hero | WakeForest |
| 2 | Three Column CTA | Wake Forest - Hero CTAs | WakeForest |
| 3 | Two Column CTA | Wake Forest - Wake Up | WakeForest |
| 4 | Two Column CTA | Wake Forest - Motto | WakeForestMotto |

**Rendering paths:**
- `/sitecore/layout/Renderings/Project/Financial/Page Content/Hero`
- `/sitecore/layout/Renderings/Project/Financial/Page Content/Three Column CTA`
- `/sitecore/layout/Renderings/Project/Financial/Page Content/Two Column CTA`

---

## 4. Set hero + section images

After Content Hub upload, update these datasource Image fields:

| Datasource | Field | Local file |
|------------|-------|------------|
| Wake Forest - Hero | Image | `images/section1-img1.jpg` |
| Wake Forest - Wake Up | Image2 | `images/section3-img2.webp` |
| Wake Forest - Motto | Image1 | `images/section4-img6.webp` |

---

## 5. Remaining sections (not yet built)

These WFU homepage sections still need datasource items and components:

- News grid (Article List or Carousel)
- Why Wake Forest split (Features or custom Two Column CTA)
- By the Numbers stats (Stats Counter)
- Colleges & Schools (Five Column CTA)
- Athletics CTA (CTA Banner / Promo CTA)
- Header + Footer (partial designs)

---

## 6. Personalization (Optional)

Create segment-specific datasource copies using naming: `Wake Forest - <Component> - <Segment>`

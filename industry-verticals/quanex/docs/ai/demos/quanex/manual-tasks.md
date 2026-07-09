# Quanex Demo — Manual Assembly Tasks

The page assembly API returned errors when wiring components. Complete these steps in **Pages** or **Content Editor** for `/sitecore/content/Manufacturing/Quanex/Home`.

## Page setup

1. Set page **Title** field to `Quanex`
2. Remove or hide starter-kit sections not needed for the demo:
   - Comparison (×2)
   - Carousel
   - Five Column CTA
   - Documents List
   - App Promo (unless repurposed)
   - Article List (optional — Four Column CTA covers news)

## Recommended component order (top → bottom)

| # | Component | Variant | Datasource |
|---|-----------|---------|------------|
| 1 | Hero | Quanex | `/Data/Promos/Quanex - Hero` |
| 2 | Heading CTA | Quanex | `/Data/Promos/Promo CTA/Quanex - Value Intro` |
| 3 | Three Column CTA | Quanex | `/Data/Promos/Three Column CTA/Three Column CTA 1` |
| 4 | Two Column CTA | Quanex | `/Data/Promos/Two Column CTA/Two Column CTA 1` |
| 5 | Promo CTA | QuanexCareers | `/Data/Promos/Promo CTA/Promo CTA 1` |
| 6 | Heading CTA | Quanex | `/Data/Promos/Promo CTA/Quanex - Facility Locator` |
| 7 | Promo CTA | QuanexHardware | `/Data/Promos/Promo CTA/Promo CTA 2` |
| 8 | Four Column CTA | Quanex | `/Data/Promos/Four Column CTA/Progressive - Why Progressive` |

## Partial designs

- **Header** partial: set variant to **Quanex**, update nav link labels (Products, Innovations, Service & Support)
- **Footer** partial: set variant to **Quanex**, update link columns and copyright to Quanex corporate info

## Variant GUIDs (FieldNames parameter)

| Component | Variant | Item ID |
|-----------|---------|---------|
| Hero | Quanex | `{8B4CDF8D-5FC4-439A-9482-7D54CA9281FF}` |
| Header | Quanex | `{E3A2CBA3-EEBC-4D35-8742-BA22AD933B86}` |
| HeadingCta | Quanex | `{95CC8C47-DD5E-4F44-B217-1B8E6A2C6CC8}` |
| PromoCta | QuanexCareers | `{7EA2E16C-A434-43CD-9A4F-D21BC1DA4081}` |
| PromoCta | QuanexHardware | `{97B886A5-1E5E-4D3A-8779-F19BF4457712}` |
| FourColumnCta | Quanex | `{D04E96BD-830A-4B32-955E-9BD6AC27E3CA}` |
| Footer | Quanex | `{48828E79-96B4-40AF-9BCA-1C614D2FE981}` |

## Images

Datasource images use starter-kit media library placeholders. Replace with Quanex brand photography via Content Hub or Media Library for production fidelity.

## Dev server

After pulling code changes, restart the quanex rendering host so new component variants are picked up:

```bash
cd industry-verticals/quanex
npm run dev
```

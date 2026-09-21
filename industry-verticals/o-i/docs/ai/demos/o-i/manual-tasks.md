# O-I Demo — Manual Tasks

Complete these in Pages / Content Editor. Do **not** hide leftover components with CSS or empty variants.

The API cannot set Headless Variant (`FieldNames`). After code deploys, select each OI variant in Pages.

## 1. Select variants (required for pixel-perfect)

Open Home (`/sitecore/content/manufacturing/o-i/Home`) in Pages → Design → variant:

| # | Component on page | Needed variant | Variant item ID |
|---|-------------------|----------------|-----------------|
| 2 | Four Column CTA (news grid) | **OINewsGrid** | `{7975A81A-BEFB-4FD4-AA57-2ED17A1DF534}` |
| 3 | Promo CTA (hero copy) | **OIHero** | `{EE894261-ACC7-4FAD-9EE2-EA033B8AF883}` |
| 4 | Carousel | **OI** | `{CD68EF7D-6E13-47A2-A89A-6383ADF41C5B}` |
| 5 | Promo CTA (Power of Glass) | **OIImageLeft** | `{66E7380A-B647-4DB1-9BBC-792A1D541D72}` |
| 6 | Promo CTA (Guided by Our Values) | **OIValues** | `{E854F333-27B8-4EE1-A373-92E533D3BAF5}` |
| 7 | Heading CTA (Stay Connected) | **OINewsletter** | `{AEC58152-80BB-4C06-8C1B-1935E38A448E}` |

Header / Footer live in partial designs:

| Component | Needed variant | Variant item ID | Datasource |
|-----------|----------------|-----------------|------------|
| Header | **OI** | `{04D87FF2-0A87-477E-B8A7-0A232EABF859}` | `/sitecore/content/manufacturing/o-i/Data/OI Header` |
| Footer | **OI** | `{AF357604-FCD0-4C00-89EC-7C4DF6DDB9EF}` | `/sitecore/content/manufacturing/o-i/Data/OI Footer` |

Estimated time: ~4 minutes.

## 2. Remove leftover PLAY! components (MCP cannot delete)

| Component | Why |
|-----------|-----|
| Promo CTA (`d49a8931-…`, Home/Data Promo CTA 1) | Leftover after Vision became Carousel |
| Five Column CTA | Banking leftover |
| Three Column CTA | Banking leftover |
| Two Column CTA | Banking leftover |
| Article List | Banking leftover |
| Documents List | Banking leftover |
| App Promo | Banking leftover |

## 3. Hero Banner (optional, for true 50/50)

Hero Banner is **not** in Available Renderings for `headless-main`, so the homepage uses Promo CTA **OIHero** for the “Innovation. Transformation. Glass Packaging.” copy.

To match the live 50/50 (news grid left, copy right):

1. In Content Editor, add **Hero Banner** to Page Content Available Renderings (do not replace the existing list).
2. Add Hero Banner to Home, assign `/sitecore/content/manufacturing/o-i/Data/OI Hero`, variant **OI** `{82D374F7-C0F9-4E62-BA95-6691CDC10508}`.
3. Move Four Column CTA into the `hero-banner` placeholder.
4. Remove the Promo CTA **OIHero** instance.

## 4. Images

Automated Content Hub upload succeeded (11 assets, approved, with public links). No manual image upload required unless a webp fails to render in Next.js Image — then re-save that DAM asset as JPEG.

## 5. Reorder (if needed)

Ideal order: Header → News grid → Hero copy → Carousel → Power of Glass → Values → Stay Connected → Footer.

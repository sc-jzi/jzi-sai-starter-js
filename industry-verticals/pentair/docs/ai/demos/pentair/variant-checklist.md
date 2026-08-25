# Variant Selection Checklist — Pentair

Open **Home** (`/sitecore/content/manufacturing/pentair/Home`) in Pages editor. Click each component, open the **Design** tab, and set the variant.

Site name in preview is `Pentair` (maps to `site-pentair` theme class).

| # | Component | Current | Needed | Variant ID |
|---|-----------|---------|--------|-----------|
| 1 | Header (partial) | Default / WithLogoImage | **Pentair** | `{74BAD22A-5D1F-48C6-8DCC-2D050A6F3265}` |
| 2 | Hero | Default | **Pentair** | `{EC1E029E-DA1A-4D5E-9E90-66E598AF5A0A}` |
| 3 | Three Column CTA (Move / Improve / Enjoy) | Default | **Pentair** | `{477CE45B-A3CC-455F-9E7F-4C04EF005FFE}` |
| 4 | Three Column CTA (Sustainability Spotlight) | Default | **PentairSpotlight** | `{DA452B52-8A7A-4796-8D9E-68DAC3B5A5A4}` |
| 5 | Promo CTA (Careers) | Default | **Pentair** | `{E84755FD-9F1C-4C06-AEFB-166980DE39D8}` |
| 6 | Promo CTA (mySüdmo) | Default | **Pentair** | `{E84755FD-9F1C-4C06-AEFB-166980DE39D8}` |
| 7 | Promo CTA (Everpure) | Default | **PentairAlt** | `{B0726039-541C-4371-9ADA-27B0B1ED6C73}` |
| 8 | Promo CTA (IntelliFlo3) | Default | **Pentair** | `{E84755FD-9F1C-4C06-AEFB-166980DE39D8}` |
| 9 | Heading CTA (News) | Default | **Pentair** | `{A3604F1F-B6F0-4395-AA98-361063869CE5}` |
| 10 | Footer (partial) | Default | **Pentair** | `{F5628DA9-09E3-4F2B-B4F3-36347D5B8DCF}` |

Steps per component:

1. Click the component on the canvas
2. In the right-hand pane, open the Design tab
3. Select the variant from the dropdown (name must match the TSX export exactly)
4. Repeat for the next component

Estimated time: ~3 minutes after components are on the page.

**Code must be deployed** (`npm run dev` / rebuild) so the named exports are in `.sitecore/component-map.ts` before variants will render.

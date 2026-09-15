# Akamai Demo Summary

> **Site:** `/sitecore/content/technology/akamai`  
> **Code:** `industry-verticals/akamai`  
> **Source:** https://www.akamai.com/  
> **Built:** 2026-09-14

## Build Overview

| Metric | Count |
|--------|------:|
| Template sections | 12 |
| Custom components | 0 |
| Pixel-perfect variants (React + Sitecore defs) | 11 exports / 11 defs |
| Datasources created / populated | 10+ |
| Images auto-uploaded | 0 (Edge blocked scraper) |
| Theme delivery | `globals.scss` inlined `:root` + Source Sans 3 |

## Component Inventory

| # | Section | Component | Status |
|---|---------|-----------|--------|
| 1 | Header | Header | ✅ Partial — select **Akamai** variant |
| 2 | AI Summit hero | Hero | ✅ Wired to `Akamai - Hero` — set **Akamai** variant |
| 3 | Cloud / Security tiles | Two Column CTA | ✅ Wired — set **AkamaiProductTiles** |
| 4 | Forrester Leader | Promo CTA | ✅ Wired — set **Akamai** |
| 5 | AI Infrastructure | Promo CTA | ✅ Wired — set **AkamaiImageLeft** |
| 6 | What's new title | Heading CTA | ✅ Populated — set **AkamaiSectionTitle** (currently Contact) |
| 7 | What's new cards | Four Column CTA | ✅ Populated — **AkamaiWhatsNew** already selected |
| 8 | Brand banner | CTA Banner | ✅ Populated — **AkamaiBrand** already selected |
| 9 | Capabilities title | Heading CTA | ✅ Populated — set **AkamaiSectionTitle** |
| 10 | Capabilities columns | Three Column CTA | ✅ Wired — set **Akamai** |
| 11 | Contact us | Heading CTA | ✅ Populated — **AkamaiContact** already selected |
| 12 | Footer | Footer | ✅ Partial — select **Akamai** + wire footer DS |

## Theme

- Primary `#002856`, Secondary `#0099CC`, Accent `#FF6B00`
- Applied in `src/app/globals.scss` + Source Sans 3 via `layout.tsx`
- React variants: [Akamai variants](5ed7aa50-2c71-48b4-a946-7945f3da1410)

## Images

> [!WARNING]
> Akamai Edge returned Access Denied to Playwright. No images were downloaded/uploaded. Hero reuses an existing Content Hub image; other image fields need manual Content Hub upload (see `manual-tasks.md`).

## Manual Tasks

See **`manual-tasks.md`** and **`variant-checklist.md`**.

Critical:
1. **Delete** Five Column CTA, Article List, Documents List, App Promo, and the spare Promo CTA (MCP cannot remove them).
2. **Select variants** listed in the checklist (MCP cannot set `FieldNames` reliably for all; some new components already picked Akamai defs).
3. **Upload images** for tiles, reports, brand mark, and capability photography.
4. **Reorder** in Pages if needed (Hero → tiles → Forrester → AI → What's new → cards → brand → capabilities → contact).

## Personalization (Optional)

Naming: `Akamai - <Component> - <Segment>` in the same Data folders, then Personalize in Pages.

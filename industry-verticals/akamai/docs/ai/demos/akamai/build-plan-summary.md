# Akamai — Build Plan

> **Source:** https://www.akamai.com/
> **Analyzed:** September 14, 2026
> **Sections:** 12 (12 template, 0 custom)

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _White header with logo, Products/Solutions/Pricing/Developers/Resources, utility links, and blue Contact sales_ | Header | Akamai | High | Partial design — manual |
| 2 | _Navy AI Summit hero with cyan wave art and orange Register today_ | Hero | Akamai | High | Already on Home — re-wire |
| 3 | _Two navy dotted tiles: Akamai Cloud + Akamai Security with orange CTAs_ | Two Column CTA | AkamaiProductTiles | High | |
| 4 | _Forrester Leader row — copy left, FORRESTER logo card right_ | Promo CTA | Akamai | High | Already on Home — re-wire |
| 5 | _AI stack graphic + Understanding the 4 Stages of AI Infrastructure_ | Promo CTA | AkamaiImageLeft | High | Second instance |
| 6 | _"What's new" section title_ | Heading CTA | AkamaiSectionTitle | High | Title-only strip |
| 7 | _Four news/resource cards with CTAs (carousel on live site)_ | Four Column CTA | AkamaiWhatsNew | Medium | Grid first; carousel optional in 5.5 |
| 8 | _Dark brand banner — Everywhere you do business…_ | CTA Banner | AkamaiBrand | High | |
| 9 | _"Build applications everywhere…" section headline_ | Heading CTA | AkamaiSectionTitle | High | Three Column has no title field |
| 10 | _Three capability columns: Cloud, Security, Content delivery_ | Three Column CTA | Akamai | High | Already on Home — re-wire |
| 11 | _Ready to get started / Contact us band_ | Heading CTA | AkamaiContact | High | |
| 12 | _Multi-column footer with socials and logo_ | Footer | Akamai | High | Partial design — manual |

---

## Sections that need attention

> [!WARNING]
> These need review before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 7 | _What's new cards with carousel arrows_ | Four Column CTA is a static 4-up grid; live site carousels | Approve grid for demo, or request carousel behavior in Phase 5.5 |
| 3 | _Cloud / Security product tiles_ | Default Two Column expects photography | AkamaiProductTiles variant (navy dotted tiles) |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | Akamai | Utility row + centered primary nav + Contact sales |
| 2 | Hero | Akamai | Left copy on navy abstract background, orange CTA |
| 3 | Two Column CTA | AkamaiProductTiles | Solid navy tiles, not photo cards |
| 4 | Promo CTA | Akamai | Clean analyst-report / logo-card layout |
| 5 | Promo CTA | AkamaiImageLeft | Graphic on the left (inverse of #4) |
| 6 / 9 | Heading CTA | AkamaiSectionTitle | Title-only section headers |
| 7 | Four Column CTA | AkamaiWhatsNew | Resource cards with visible CTAs |
| 8 | CTA Banner | AkamaiBrand | Full-bleed navy brand statement |
| 10 | Three Column CTA | Akamai | Capability photography + blue CTAs |
| 11 | Heading CTA | AkamaiContact | Centered contact strip |
| 12 | Footer | Akamai | Five columns + socials + navy |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero | Simple (1 item) |
| 3 | Two Column CTA | Simple (1 item) |
| 4 | Promo CTA | Simple (1 item) |
| 5 | Promo CTA | Simple (1 item) |
| 6 | Heading CTA | Simple (1 item) |
| 7 | Four Column CTA | Simple (1 item) |
| 8 | CTA Banner | Simple (1 item) |
| 9 | Heading CTA | Simple (1 item) |
| 10 | Three Column CTA | Simple (1 item) |
| 11 | Heading CTA | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Select Akamai variant (and logo/links as needed) |
| 12 | Footer | Footer partial design | Assign Akamai Footer datasource + Akamai variant |

### Custom components needed

None — all sections map to Financial starter components. Pixel-perfect look depends on Phase 5.5 Akamai variants.

### Manual page cleanup (cannot remove via MCP)

Home currently also has Five Column CTA, Documents List, Article List, App Promo, and extra Promo/Two Column instances. These must be removed in Pages editor — will be listed in `manual-tasks.md`. Do **not** hide them with CSS or empty variants.

---

## Build Order

```
Phase 1 — Sitecore content (create Akamai datasource items):
  1. Hero
  2. Two Column CTA (product tiles)
  3. Promo CTA (Forrester)
  4. Promo CTA (AI Infrastructure)
  5. Heading CTA (What's new)
  6. Four Column CTA (What's new cards)
  7. CTA Banner (brand)
  8. Heading CTA (Build applications…)
  9. Three Column CTA (capabilities)
  10. Heading CTA (Contact)
  11. Footer (if datasource used)

Phase 2 — Apply Akamai theme (CSS variables + Source Sans 3)

Phase 3 — Custom components: none

Phase 5.5 — Akamai named variants (if you choose pixel-perfect)

Phase 6 — Assemble Home: add/reorder + wire datasources
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table to the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5 — Akamai named exports for each component), **or are generic/Default Financial variants sufficient?**

> Reply **approved** (and answer question 2) to proceed, or describe any changes needed.

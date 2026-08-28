# Pentair Flow — Build Plan

> **Source:** https://www.pentair.com/en-us/flow.html
> **Analyzed:** 2026-08-28
> **Sections:** 10 (9 existing pentairflow components, 1 custom)
> **Content root:** `/sitecore/content/pentair/pentair-flow`
> **Code root:** `/industry-verticals/pentairflow`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Thin navy utility bar with Pentair.com, Careers, Contact, Find a Dealer_ | Eyebrow | Default → PentairFlow | High | Already in header partial — update content only |
| 2 | _White bar: Pentair Flow logo, Brands / Products / Resources / Sustainability / About, search_ | Header + Navigation | WithLogoImage → PentairFlow | High | Already in header partial — update logo + links |
| 3 | _Full-bleed farm field with centered “Moving Forward What's Essential”_ | Hero | **PentairFlow (new)** | High | Existing Hero is stacked text + CTA, not an overlay |
| 4 | _Bright-blue band heading: For Homes, Communities, Industries and The Planet_ | Heading CTA | Centered → PentairFlow | High | Hide eyebrow and button |
| 5 | _Two photo tiles; green Watch button on the left_ | Two Column CTA | **PentairFlow (new)** | High | Image-first tiles, not PLAY! stacked cards |
| 6 | _Making an Impact video stage + thumbnail strip_ | Carousel | **PentairFlow (new)** | High | Videos stay manual; posters go in Image |
| 7 | _Gray “Who We Serve” heading_ | Heading CTA | Centered → PentairFlowMuted | High | Second Heading CTA datasource |
| 8 | _Four markets: image left, bullets right, blue brand-tag grid_ | **Market Segment (custom)** | Default | Low | No existing component covers this layout |
| 9 | _Resources & Portal blue link bar_ | Five Column CTA | **PentairFlow (new)** | Medium | Only 5 slots — may need a second instance or Link List |
| 10 | _Navy footer, mission copy, 4 link columns, socials_ | Footer | WithSocials → PentairFlow | High | Already in footer partial — update content only |

---

## Sections that need attention

> [!WARNING]
> These sections have low confidence or need custom work. Review before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 8 | _Who We Serve repeating market blocks with brand tags_ | No PLAY! or UIIM component has image + check-bullets + a button grid | **Recommended:** new `MarketSegment` list component. Faster fallback: 4 Promo CTA items with bullets in Rich Text |
| 9 | _Resources & Portal has 15+ links in audience groups_ | Five Column CTA only holds five links | Two Five Column CTA instances, or switch to Link List if you want the full portal set |
| — | _Home is still titled “PLAY! Financial”_ | Starter banking pages sit under Home | We will reuse Home (skill default) and list leftover pages for manual cleanup |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 3 | Hero | PentairFlow (new) | Full-bleed photo, centered white uppercase type, no CTA |
| 4 | Heading CTA | PentairFlow (new) | Uppercase white heading on Bright Blue, no button |
| 5 | Two Column CTA | PentairFlow (new) | Two image tiles + one green Watch button |
| 6 | Carousel | PentairFlow (new) | Stage + labeled thumbnail strip, not a full-bleed slider |
| 7 | Heading CTA | PentairFlowMuted (new) | Gray uppercase on white |
| 9 | Five Column CTA | PentairFlow (new) | Horizontal blue link bar, images hidden |
| 10 | Footer | WithSocials | Four columns + socials already exist; restyle to navy |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Hero | Simple (1 item) |
| 4 | Heading CTA (impact) | Simple (1 item) |
| 5 | Two Column CTA | Simple (1 item) |
| 6 | Carousel | List (parent + 7 story children) |
| 7 | Heading CTA (who we serve) | Simple (1 item) |
| 9 | Five Column CTA | Simple (1 item, 5 links) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Eyebrow | Header partial | Update utility-bar links |
| 2 | Header + Navigation | Header partial | Swap logo and nav labels |
| 10 | Footer | Footer partial | Swap mission copy, columns, socials |

### Custom components needed

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| 8 | Four Who We Serve markets with brand tags | New `MarketSegment` list (Phase 5) | Title, image, description, 6 bullet fields, BrandTag children (text + link) |

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/pentair/pentair-flow):
  1. Hero
  2. Heading CTA (impact)
  3. Two Column CTA
  4. Carousel (7 impact stories)
  5. Heading CTA (who we serve)
  6. Five Column CTA (resources)

Phase 2 — Apply theme (Barlow fonts + Pentair CSS variables in src/assets/sass)

Phase 3 — Custom component
  7. MarketSegment (Who We Serve)
```

---

## Environment notes (read before approving)

- This starter does **not** contain the 18-component UIIM library the skill’s registry describes. The build uses the PLAY! components already registered on `pentair-flow`.
- `project.yaml` still pointed at `main/main-website`. It will be updated to `pentair` / `pentair-flow` if you approve.
- Home page layout could not be read (`get_components_on_page` returned 500). Assembly will retry and flag leftover PLAY! renderings for cleanup.
- You wrote “Pentair Pool”; the URL, screenshot, and path are **Pentair Flow**. A `pentairpool` site also exists. This plan targets `/sitecore/content/pentair/pentair-flow`.

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table above to the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic PLAY! variants sufficient?

> Reply **"approved"** to proceed, or describe any changes needed.

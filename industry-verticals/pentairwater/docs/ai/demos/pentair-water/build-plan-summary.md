# Pentair Water — Build Plan

> **Source:** https://www.pentair.com/en-us/water-solutions.html
> **Analyzed:** 2026-08-28
> **Sections:** 12 (12 existing pentairwater components, 0 custom)
> **Content root:** `/sitecore/content/pentair/pentair-water`
> **Code root:** `/industry-verticals/pentairwater`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Thin utility bar: Home Water, Foodservice, Pentair.com, Contact, Find a Dealer, Partner Portal_ | Eyebrow | Default → PentairWater | High | Already in header partial — update content only |
| 2 | _White bar: Pentair Water Solutions logo, Products / Top Brands / Our Impact / Investors, search_ | Header + Navigation | WithLogoImage → PentairWater | High | Already in header partial — update logo + links |
| 3 | _Split hero: “You Deserve Water at its Best” left, pouring-water photo right, Explore Solutions button_ | Hero | **PentairWater (new)** | High | Existing Hero is stacked photo + text, not a split |
| 4 | _Three circular blue icons: quality, protect equipment, efficiency_ | Three Column CTA | WithIcons → **PentairWaterIcons (new)** | High | WithIcons exists but icons are 32px, not outlined circles |
| 5 | _Thin centered “SOLUTIONS” heading_ | Heading CTA | Centered → PentairWater | High | Hide eyebrow and button |
| 6 | _Three solution cards: Home Water, Foodservice / Everpure, Commercial Ice / Manitowoc_ | Three Column CTA | Default → **PentairWaterCards (new)** | High | Second instance; text-arrow links instead of filled buttons |
| 7 | _“Learn How We Improve Water” + kitchen video with blue play overlay_ | Promo CTA | **PentairWaterVideo (new)** | High | Poster image now; video URL is a manual task |
| 8 | _Thin centered “OUR SUSTAINABLE WATER PARTNERSHIPS” heading_ | Heading CTA | Centered → PentairWater | High | Same variant as Solutions |
| 9 | _Three partner logos: Twins, Wild, MSP airport_ | Three Column CTA | Default → **PentairWaterLogos (new)** | High | Third instance; logos, not photos |
| 10 | _Outlined “VIEW ALL PARTNERSHIPS” button_ | Heading CTA | **PentairWaterOutline (new)** | High | Link only — heading left empty |
| 11 | _“Our Commitment to Water Improvement” + 23.7 billion bottles paragraph_ | Promo CTA | **PentairWaterStatement (new)** | High | Needs Rich Text for the bold stat; no image |
| 12 | _Navy footer, mission copy, 4 link columns, socials_ | Footer | WithSocials → PentairWater | High | Already in footer partial — update content only |

---

## Sections that need attention

> [!NOTE]
> All sections matched existing PLAY! components with medium or high confidence. No new Sitecore component types. Pixel-perfect look depends on Phase 5.5 variants.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Split hero_ | Hero Default is a full-width photo with text underneath | New `PentairWater` Hero variant. Fallback if variants are skipped: Promo CTA Default is already split |
| 4 | _Three circular outline icons_ | Features only has two items; WithIcons uses tiny 32px images | New `PentairWaterIcons` on Three Column CTA |
| 7 | _Video stage_ | Videos are not uploaded by the pipeline | Poster image in Promo CTA; SE uploads the video later |
| — | _Home is still titled “PLAY! Financial”_ | Starter banking pages sit under Home | We will reuse Home (skill default) and list leftover pages for manual cleanup |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 3 | Hero | PentairWater (new) | Split text/image, two-tone uppercase headline, Bright Blue CTA |
| 4 | Three Column CTA | PentairWaterIcons (new) | Circular outlined icons, no links |
| 5 / 8 | Heading CTA | PentairWater (new) | Thin uppercase navy heading, no button |
| 6 | Three Column CTA | PentairWaterCards (new) | Photo cards + brand lockups + text-arrow links |
| 7 | Promo CTA | PentairWaterVideo (new) | Centered title + 16:9 poster + play overlay |
| 9 | Three Column CTA | PentairWaterLogos (new) | Partner logos, not photos |
| 10 | Heading CTA | PentairWaterOutline (new) | Outlined Bright Blue button only |
| 11 | Promo CTA | PentairWaterStatement (new) | Centered heading + rich-text body, no image |
| 12 | Footer | WithSocials | Four columns + socials already exist; restyle to navy |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Hero | Simple (1 item) |
| 4 | Three Column CTA (benefits) | Simple (1 item) |
| 5 | Heading CTA (Solutions) | Simple (1 item) |
| 6 | Three Column CTA (solutions) | Simple (1 item) |
| 7 | Promo CTA (video) | Simple (1 item) |
| 8 | Heading CTA (partnerships) | Simple (1 item) |
| 9 | Three Column CTA (partners) | Simple (1 item) |
| 10 | Heading CTA (view all) | Simple (1 item) |
| 11 | Promo CTA (commitment) | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Eyebrow | Header partial | Update utility-bar links |
| 2 | Header + Navigation | Header partial | Swap logo and nav labels |
| 12 | Footer | Footer partial | Swap mission copy, columns, socials |

### Custom components needed

None — all sections matched template components.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/pentair/pentair-water):
  1. Hero
  2. Three Column CTA (benefits)
  3. Heading CTA (Solutions)
  4. Three Column CTA (solutions cards)
  5. Promo CTA (video)
  6. Heading CTA (partnerships)
  7. Three Column CTA (partners)
  8. Heading CTA (view all)
  9. Promo CTA (commitment)

Phase 2 — Apply theme (Barlow fonts + Pentair CSS variables in src/assets/sass)

Phase 3 — Custom components
  (none)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic template variants sufficient?

> Reply **approved** to proceed, or describe any changes needed.

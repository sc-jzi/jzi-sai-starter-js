# Covista — Build Plan

> **Source:** https://www.covista.com
> **Analyzed:** 2026-09-02
> **Sections:** 12 (12 template, 0 custom)
> **Library:** PLAY! Financial components on `/sitecore/content/covista/covista`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Solid forest-green bar with the white covista wordmark, six nav links, and a search icon_ | Header + Navigation | Covista | High | Already in the Header partial — update, do not re-add |
| 2 | _Full-bleed clinician photo, white headline "The Talent to Transform Healthcare", small Our story button, five square dots_ | Carousel | Covista | High | Already on Home — rewire to new slides |
| 3 | _Three white cards overlapping the hero: 5 institutions, 26K graduates, 300K+ alumni_ | Stats Counter | CovistaCards | High | New. Default is a PLAY! number row |
| 4 | _Photo of two clinicians in scrubs next to a dusty-rose card about Care Capacity Monitor research_ | Promo CTA | CovistaResearch | High | Rewire the first Promo CTA on Home |
| 5 | _Terracotta serif heading "Our institutions" and a short partner sentence_ | Heading CTA | Covista | High | New |
| 6 | _Five partner logos in a row (AUC, Chamberlain, Ross Med, Ross Vet, Walden) plus Learn more_ | Five Column CTA | CovistaLogos | High | Already on Home — rewire |
| 7 | _Nurse-with-patient photo on the left, "Supporting healthcare workers nationwide" on the right_ | Promo CTA | CovistaSplit | High | Rewire the second Promo CTA |
| 8 | _"Careers that blend performance and purpose" on the left, meeting photo on the right_ | Promo CTA | CovistaSplitReverse | High | Rewire the third Promo CTA |
| 9 | _Cream stock band: NYSE CVTA, large terracotta price, story card over a portrait_ | CTA Banner | CovistaStock | Medium | No dedicated price field — Title holds the number |
| 10 | _Terracotta heading "News and stories"_ | Heading CTA | Covista | High | Reuse the institutions heading variant |
| 11 | _Four editorial cards with photo, category tag, headline, and arrow_ | Four Column CTA | CovistaStories | High | Safer than Article List (needs article pages) |
| 12 | _Forest-green mega footer with wordmark, four link columns, legal links, and social icons_ | Footer | Covista | High | Already in the Footer partial |

---

## Sections that need attention

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 9 | _Stock ticker + story card + portrait_ | CTA Banner has no price / ticker / change fields | Eyebrow = `NYSE: CVTA`, Title = `$129.90`, Text = story + change. Live scrape was $129.90; your screenshot showed $134.16 — Phase 2.5 will take the live value |

> All other sections matched with high confidence. No custom components to build from scratch.

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | Covista (from WithLogoImage) | Solid forest-green bar, not PLAY! banking chrome |
| 2 | Carousel | Covista | Left overlay headline + square markers; Default is a right-offset text column |
| 3 | Stats Counter | CovistaCards | Three overlapping white cards; Default has dotted accents and side photos |
| 4 | Promo CTA | CovistaResearch | Dusty-rose overlapping panel, not a generic split |
| 5 / 10 | Heading CTA | Covista | Centered terracotta serif; Default always shows eyebrow + button |
| 6 | Five Column CTA | CovistaLogos | Logos only; Default is five photo cards |
| 7 | Promo CTA | CovistaSplit | Image left / text right with pill+arrow button |
| 8 | Promo CTA | CovistaSplitReverse | Mirror of the support block |
| 9 | CTA Banner | CovistaStock | Ticker + oversized price + story card |
| 11 | Four Column CTA | CovistaStories | Editorial image + tag + headline cards |
| 12 | Footer | Covista (from WithSocials) | Forest-green mega footer |

Generic Default variants will look like PLAY! Financial. Pixel-perfect matching needs Phase 5.5.

---

## Components by type

### Will be added or rewired automatically (API-addable)

| # | Component | Datasource needed | On Home today |
|---|-----------|-------------------|---------------|
| 2 | Carousel | List (parent + slide children) | Yes — rewire |
| 3 | Stats Counter | Simple (1 item) | No — add |
| 4 | Promo CTA (Research) | Simple (1 item) | Yes — rewire |
| 5 | Heading CTA (Institutions) | Simple (1 item) | No — add |
| 6 | Five Column CTA | Simple (1 item, 5 logo slots) | Yes — rewire |
| 7 | Promo CTA (Support) | Simple (1 item) | Yes — rewire |
| 8 | Promo CTA (Careers) | Simple (1 item) | Yes — rewire |
| 9 | CTA Banner (Stock) | Simple (1 item) | No — add |
| 10 | Heading CTA (News) | Simple (1 item) | No — add |
| 11 | Four Column CTA (Stories) | Simple (1 item, 4 cards) | No — add a clean instance |

### Must be placed / updated manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header + Navigation | `/Presentation/Partial Designs/Header` | Set Covista variant, swap logo, update nav labels |
| 12 | Footer | `/Presentation/Partial Designs/Footer` | Set Covista variant, update columns / socials / copyright |

### Custom components needed

None — all sections matched PLAY! Financial components.

---

## Already on Home (cleanup)

These PLAY! leftovers stay until someone removes them in Pages (MCP cannot delete renderings):

- Comparison × 2
- Two Column CTA
- Documents List
- App Promo
- Four Column CTA with an empty datasource (nested row)
- Article List (replaced in the plan by Four Column CTA)

Home title is still **PLAY! Financial**. Banking child pages (`personal`, `business`, `get-a-loan`, …) stay for later cleanup.

---

## Build Order

```
Phase 1 — Sitecore content (create Covista datasource items under Data/Promos):
  1. Carousel — Hero slides
  2. Stats Counter — 5 / 26K / 300K+
  3. Promo CTA — Research
  4. Heading CTA — Our institutions
  5. Five Column CTA — Institution logos
  6. Promo CTA — Support
  7. Promo CTA — Careers
  8. CTA Banner — Stock
  9. Heading CTA — News and stories
  10. Four Column CTA — News cards

Phase 2 — Apply theme (Sass tokens + Josefin Slab / Source Sans 3)

Phase 3 — Custom components (none)

Phase 5.5 — Covista named variants (if you want pixel-perfect)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the homepage screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) **or are the generic PLAY! variants sufficient?**

> Reply "approved" to proceed, and say whether you want Phase 5.5 variants.

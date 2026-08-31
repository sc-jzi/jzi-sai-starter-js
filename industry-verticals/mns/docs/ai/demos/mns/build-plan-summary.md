# Métis Nation–Saskatchewan — Build Plan

> **Source:** https://mns.ca
> **Analyzed:** 2026-08-31
> **Sections:** 15 (15 existing PLAY! components, 0 custom)
> **Content root:** `/sitecore/content/public-sector/mns`
> **Code root:** `/industry-verticals/mns`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Orange bar: “Become an MN-S Citizen: Register today!”_ | Eyebrow | **Mns (new)** | High | Already in header partial — restyle + update link |
| 2 | _Bison logo, navy uppercase nav, orange search button_ | Header + Navigation | WithLogoImage → **Mns (new)** | High | Already in header partial — swap logo + labels |
| 3 | _Full-bleed photo carousel: “Métis Rising”, arrows + 4 dots_ | Carousel | Default → **Mns (new)** | High | Left-align overlay; italic Find Out More |
| 4 | _Tile row 1: Ma Faamii, PMC, MNLA, Métis Gathering_ | Four Column CTA | **MnsTiles (new)** | High | Color tiles + cultural motifs, not photos |
| 5 | _Tile row 2: Back to Batoche, SaskMétis Works, Our Nation, Services_ | Four Column CTA | **MnsTiles (new)** | High | Second instance; same variant |
| 6 | _Centered “Featured MN–S Events”_ | Heading CTA | Centered → **Mns (new)** | High | Hide eyebrow and button |
| 7 | _Three event cards: Youth Gathering, PMC Meeting, Constellations_ | Three Column CTA | Default → **MnsEvents (new)** | High | Live site now has 3 cards (earlier screenshot had 2) |
| 8 | _“View Full Calendar” text link_ | Heading CTA | **MnsTextLink (new)** | High | Link only |
| 9 | _Centered “Latest Stories”_ | Heading CTA | **Mns (new)** | High | Same heading variant |
| 10 | _2×2 text cards: Batoche honour, Little Buffalo, People of the Horse, federal recognition_ | Four Column CTA | **MnsStories (new)** | High | No photos; thin blue borders |
| 11 | _“All MN-S Stories” text link_ | Heading CTA | **MnsTextLink (new)** | High | Same as calendar link |
| 12 | _Cream bar: FOLLOW + Facebook / Instagram / LinkedIn + CONNECT_ | CTA Banner | **MnsSocials (new)** | Medium | Field fit is imperfect — social icons need a custom treatment |
| 13 | _Centered “AFFILIATES OF MNS”_ | Heading CTA | **Mns (new)** | High | Same heading variant |
| 14 | _Four logos: GDI, SMEDCO, CCDF, MACSI_ | Four Column CTA | **MnsLogos (new)** | High | Logos only |
| 15 | _Navy footer: logo, Saskatoon address, phone, calendar / newsletter / privacy / contact_ | Footer | WithSocials → **Mns (new)** | High | Already in footer partial |

---

## Sections that need attention

> [!NOTE]
> All sections matched existing PLAY! components. No new Sitecore component types. Pixel-perfect look depends on Phase 5.5 variants.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Hero carousel_ | Default Carousel puts text in a right-offset column | New `Mns` Carousel variant, left-aligned |
| 4–5 | _Color tiles_ | Four Column CTA always renders a photo | New `MnsTiles` variant with per-tile backgrounds |
| 10 | _Text-only story cards_ | ArticleList Grid requires article pages and shows thumbnails | Four Column CTA + `MnsStories` (no images) |
| 12 | _Social strip_ | CTA Banner has no social-icon fields | `MnsSocials` variant; icons from Footer social fields or hardcoded |
| — | _Home is still titled “PLAY! Financial”_ | Starter banking pages sit under Home | Reuse Home (skill default) and list leftovers for cleanup |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Eyebrow | Mns (new) | Solid orange citizenship bar |
| 2 | Header | Mns (new) | Navy bar, white uppercase nav, orange search |
| 3 | Carousel | Mns (new) | Left overlay, italic text link |
| 4 / 5 | Four Column CTA | MnsTiles (new) | Cultural color tiles |
| 6 / 9 / 13 | Heading CTA | Mns (new) | Centered primary-blue heading, no button |
| 7 | Three Column CTA | MnsEvents (new) | Event cards with date + SEE MORE |
| 8 / 11 | Heading CTA | MnsTextLink (new) | Centered text link only |
| 10 | Four Column CTA | MnsStories (new) | Bordered text cards, no images |
| 12 | CTA Banner | MnsSocials (new) | Cream follow/connect strip |
| 14 | Four Column CTA | MnsLogos (new) | Logos only |
| 15 | Footer | WithSocials | Closest structure; restyle to navy |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Carousel | List (parent + 3–4 slide children) |
| 4 | Four Column CTA (tiles row 1) | Simple (1 item) |
| 5 | Four Column CTA (tiles row 2) | Simple (1 item) |
| 6 | Heading CTA (events) | Simple (1 item) |
| 7 | Three Column CTA (events) | Simple (1 item) |
| 8 | Heading CTA (calendar) | Simple (1 item) |
| 9 | Heading CTA (stories) | Simple (1 item) |
| 10 | Four Column CTA (stories) | Simple (1 item) |
| 11 | Heading CTA (all stories) | Simple (1 item) |
| 12 | CTA Banner (social) | Simple (1 item) |
| 13 | Heading CTA (affiliates) | Simple (1 item) |
| 14 | Four Column CTA (affiliates) | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Eyebrow | Header partial | Restyle to orange bar; update citizenship link |
| 2 | Header + Navigation | Header partial | Swap logo and nav labels |
| 15 | Footer | Footer partial | Swap logo, address, links |

### Custom components needed

None — all sections matched template components.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under /sitecore/content/public-sector/mns):
  1. Carousel
  2. Four Column CTA (quick links row 1)
  3. Four Column CTA (quick links row 2)
  4. Heading CTA (Featured Events)
  5. Three Column CTA (events)
  6. Heading CTA (View Full Calendar)
  7. Heading CTA (Latest Stories)
  8. Four Column CTA (stories)
  9. Heading CTA (All Stories)
  10. CTA Banner (Follow / Connect)
  11. Heading CTA (Affiliates)
  12. Four Column CTA (affiliate logos)

Phase 2 — Apply theme (Open Sans + MN-S CSS variables in src/assets/sass)

Phase 3 — Custom components
  (none)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic template variants sufficient?

> Reply **approved** to proceed, or describe any changes needed.

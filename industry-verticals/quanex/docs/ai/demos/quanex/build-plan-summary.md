# Quanex Demo Build Plan

**Client:** Quanex · **Source:** [quanex.com](https://www.quanex.com/) · **Environment:** Manufacturing/Quanex

## Section mapping

| # | What's on the page | What we'll use | Variant | Confidence |
|---|-------------------|----------------|---------|------------|
| 1 | *Deep green header bar with Quanex logo and product navigation* | Navigation Header | Quanex | High |
| 2 | *Full-width green hero with tagline "A Part of Something Bigger" and solution categories* | Hero Banner | Quanex | High |
| 3 | *Centered value proposition "Quanex Delivers Greater Value" with Learn More button* | Heading CTA | Quanex | High |
| 4 | *Three solution columns — Fenestration, Cabinet Components, Custom Solutions* | Three Column CTA | Quanex | High |
| 5 | *Innovation section with R&D copy and large photo/video panel* | Two Column CTA | Quanex | High |
| 6 | *Dark green careers block with Search Careers CTA* | Promo CTA | QuanexCareers | High |
| 7 | *Facility locator with dropdown filters* | Heading CTA | Quanex | Medium |
| 8 | *Hardware solutions overlay on industrial image mosaic* | Promo CTA | QuanexHardware | High |
| 9 | *Four news/featured content cards* | Four Column CTA | Quanex | High |
| 10 | *Dark green corporate footer with link columns and social icons* | Footer | Quanex | High |

## Sections needing attention

| # | Issue | Resolution |
|---|-------|------------|
| 7 | Interactive facility search form | Approximated with Heading CTA + Find a Facility link |

## Build order

1. Hero — Quanex hero tagline
2. Heading CTA — Value intro
3. Three Column CTA — Solutions grid
4. Two Column CTA — Innovation
5. Promo CTA — Careers
6. Heading CTA — Facility locator intro
7. Promo CTA — Hardware solutions
8. Four Column CTA — News cards

## Status

- **Content:** Datasource items populated under `/sitecore/content/Manufacturing/Quanex/Data/`
- **Theme:** Forest green brand applied in `src/assets/quanex/` and `_quanex-demo.scss`
- **Variants:** React + Sitecore Headless Variants created
- **Assembly:** Manual page wiring required — see `manual-tasks.md`

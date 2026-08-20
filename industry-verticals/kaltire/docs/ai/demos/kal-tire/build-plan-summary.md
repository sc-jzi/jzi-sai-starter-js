# Kal Tire — Build Plan

> **Source:** https://www.kaltire.com/
> **Analyzed:** August 20, 2026
> **Sections:** 7 (5 existing components, 2 custom components)

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Two-tier utility and primary navigation with logo, product links, icons, location, and booking CTA_ | Header | KalTire | High | Existing partial-design component; manual placement |
| 2 | _Lake-and-SUV hero with white headline and an overlaid tabbed tire finder_ | Tire Finder Hero | Default | High | Custom component required |
| 3 | _Asymmetric three-panel promotion mosaic for brakes, trailer tires, and CAA savings_ | Promotional Mosaic | Default | High | Custom component required |
| 4 | _Three white assurance cards with orange icons for care, price matching, and payments_ | Three Column CTA | KalTire | High | Existing data fields fit exactly |
| 5 | _Charcoal Summer Resources section with six image cards and a centered browse CTA_ | Article List | KalTire | Medium | Uses a content-tree source; manual setup |
| 6 | _Slim light-gray advice signup strip with an orange outline button_ | Heading CTA | KalTire | High | Existing data fields fit exactly |
| 7 | _White multi-column footer with social icons and an orange legal band_ | Footer | KalTire | High | Existing partial-design component; manual placement |

## Sections that need attention

> [!WARNING]
> The hero finder and promotional mosaic need custom components because existing components cannot preserve their interaction/layout. The resources grid can reuse Article List, but its content-tree source must be configured manually.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 2 | _Hero with tabbed tire finder overlay_ | HeroBanner fields cannot represent the selector without dropping its primary behavior | Build `KalTireFinderHero` |
| 3 | _Large-left/two-right promotional mosaic_ | No existing component supports the asymmetric geometry | Build `KalTirePromoMosaic` |
| 5 | _Six resource cards on charcoal_ | Article List has no component datasource template | Create/select a Summer Resources content source, then apply the KalTire variant |

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | KalTire | Recreates the two-tier retail navigation and booking CTA |
| 4 | Three Column CTA | KalTire | Converts the existing fields into compact square assurance cards |
| 5 | Article List | KalTire | Adds the charcoal background, overlaid card titles, orange rules, and section CTA |
| 6 | Heading CTA | KalTire | Produces the slim horizontal signup strip |
| 7 | Footer | KalTire | Matches the dense white columns and orange legal bar |

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Tire Finder Hero | Simple (1 item) |
| 3 | Promotional Mosaic | List (parent + 3 children) |
| 4 | Three Column CTA | Simple (1 item) |
| 6 | Heading CTA | Simple (1 item) |

### Must be placed or configured manually

| # | Component | Where it lives | What to do |
|---|-----------|----------------|------------|
| 1 | Header | Header partial design | Keep placement and select the KalTire variant |
| 5 | Article List | Home main placeholder | Select the Summer Resources content source and KalTire variant |
| 7 | Footer | Footer partial design | Assign the Kal Tire datasource and select the KalTire variant |

### Custom components needed

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| 2 | _Hero with integrated tire finder_ | Accessible custom tablist over a full-bleed background | Title, Description, BackgroundImage, option images and links |
| 3 | _Responsive asymmetric promotional mosaic_ | List datasource with three promotional children | Title, Description, Image, Link, Theme |

## Build Order

```text
Phase 1 — Existing Sitecore datasource content:
  1. Three Column CTA
  2. Heading CTA
  3. Footer

Phase 2 — Apply Kal Tire theme:
  Orange/charcoal tokens, Montserrat, square controls

Phase 3 — Custom components:
  1. Tire Finder Hero
  2. Promotional Mosaic

Phase 4 — Pixel-perfect variants:
  Header, Three Column CTA, Article List, Heading CTA, Footer

Phase 5 — Assemble Home and finish partial-design/manual selections
```

## Approval Questions

1. **Does the section-to-component mapping look correct?**
2. **Do you want pixel-perfect custom variants** for all mapped components, or are generic existing variants sufficient?

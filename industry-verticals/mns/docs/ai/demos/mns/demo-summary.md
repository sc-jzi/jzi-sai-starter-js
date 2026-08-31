# Métis Nation–Saskatchewan — Demo Summary

> **Source:** https://mns.ca
> **Content root:** `/sitecore/content/public-sector/mns`
> **Code:** `/industry-verticals/mns`
> **Built:** 2026-08-31

## Build Overview

| Item | Count |
|------|------:|
| Existing PLAY! components used | 9 (Eyebrow, Header, Carousel, FourColumnCta, HeadingCta, ThreeColumnCta, CtaBanner, Footer, Navigation) |
| Custom Sitecore components | 0 |
| Pixel-perfect variants created | 11 named exports / Sitecore definitions |
| Datasource items created | 16 (12 parents + 4 carousel slides) |
| Images uploaded | 19 / 19 extracted (2 homepage assets still missing: services tile + 4 affiliate logos) |
| Page assembly via API | Blocked (Home layout 500 / empty placeholders / missing Verticals branch) |

## Component Inventory

| # | Section | Component | Variant | Datasource | Status |
|---|---------|-----------|---------|------------|--------|
| 1 | Citizenship bar | Eyebrow | Mns | Partial | Code done |
| 2 | Logo + navy nav | Header | Mns | Partial | Code done |
| 3 | Hero carousel | Carousel | Mns | `{57DBD733-F898-4F72-925F-FF1A3AF6BD1F}` | Created — add + variant |
| 4 | Quick links row 1 | Four Column CTA | MnsTiles | `{0E83A2A2-2133-4FC0-9FE0-3CA854C2B686}` | Created — add + variant |
| 5 | Quick links row 2 | Four Column CTA | MnsTiles | `{CE253757-D6B5-46FC-90C5-9031A86BCCD3}` | Created — add + variant |
| 6 | Featured events heading | Heading CTA | Mns | `{834E0E84-D3BE-447A-AAB9-F9C14F3B9625}` | Created — add + variant |
| 7 | Event cards | Three Column CTA | MnsEvents | `{02E50DC5-3999-4420-8293-716373AF7E1C}` | Created — add + variant |
| 8 | View Full Calendar | Heading CTA | MnsTextLink | `{A3A10995-5799-4903-96CA-05130E29F9C5}` | Created — add + variant |
| 9 | Latest Stories heading | Heading CTA | Mns | `{A2D06774-5476-44DF-A56B-F98DAB23EDBF}` | Created — add + variant |
| 10 | Story cards | Four Column CTA | MnsStories | `{232AC954-9D22-4139-B7D9-E01D7A2D8280}` | Created — add + variant |
| 11 | All MN-S Stories | Heading CTA | MnsTextLink | `{894D0D7D-FFA7-47EF-A179-C671AC83E840}` | Created — add + variant |
| 12 | Follow / Connect | CTA Banner | MnsSocials | `{98581111-7B25-43AD-BE57-9820C9E2F343}` | Created — add + variant |
| 13 | Affiliates heading | Heading CTA | Mns | `{3597EC5E-ED4D-4591-B02D-BF5135E605A8}` | Created — add + variant |
| 14 | Affiliate logos | Four Column CTA | MnsLogos | `{AFB31318-BCC8-4246-8905-89497520934C}` | Created — add + variant |
| 15 | Footer | Footer | Mns | Partial | Assign on partial |

Carousel slides:

- `{A65E1E3A-FD2E-453A-A411-FB5C42BBEB9E}` Legislative Library
- `{0E6A7401-5FFC-490F-86B7-BFD700F0C8BF}` Welcome to MN–S
- `{41026754-A26B-4BD0-A62C-D9AAF2C6517D}` Métis Rising
- `{78EA785B-C620-4C3C-A24C-C2B2D5876004}` Citizen Questions

## Theme

Applied in `src/assets/sass` as `.site-mns`, mapped from site name `mns`:

- Primary `#285d8e` · Secondary / navy `#03274e` · Accent orange `#d14900`
- Events band `#e8f1f8` · Social bar `#f3ead8`
- Font: Open Sans 400 / 800 (already loaded in the starter)

## Image Upload Summary

19 extracted images uploaded and approved on Content Hub (`jzi-verticals.sitecoresandbox.cloud`) and wired onto carousel, tile, and event datasources. See `images/image-manifest.json`.

Still needed: services tile (`banner-22.png`) and four affiliate logos. See `manual-tasks.md`.

## Videos

None. The live homepage hero is photo-only.

## Manual Tasks

Start with `manual-tasks.md` and `variant-checklist.md`.

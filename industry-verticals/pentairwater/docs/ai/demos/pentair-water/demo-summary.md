# Pentair Water — Demo Summary

> **Source:** https://www.pentair.com/en-us/water-solutions.html
> **Content root:** `/sitecore/content/pentair/pentair-water`
> **Code:** `/industry-verticals/pentairwater`
> **Built:** 2026-08-28

## Build Overview

| Item | Count |
|------|------:|
| Existing PLAY! components used | 6 (Hero, HeadingCta, ThreeColumnCta, PromoCta, Header, Footer) |
| Custom Sitecore components | 0 |
| Pixel-perfect variants created | 10 named exports / Sitecore definitions |
| Datasource items created | 9 |
| Images uploaded | 11 / 11 |
| Page assembly via API | Blocked (Home layout 500 / empty placeholders) |

## Component Inventory

| # | Section | Component | Variant | Datasource | Status |
|---|---------|-----------|---------|------------|--------|
| 1 | Utility bar | Header (baked-in eyebrow) | PentairWater | Partial | Code done |
| 2 | Logo + nav | Header | PentairWater | Partial | Code done |
| 3 | Split hero | Hero | PentairWater | `{087FF2A0-BBF0-4B30-AFA6-4CD5A4386559}` | Created — add + variant |
| 4 | Benefit icons | Three Column CTA | PentairWaterIcons | `{98C5DB17-0069-453E-A68F-3DF4C0372653}` | Created — add + variant |
| 5 | Solutions heading | Heading CTA | PentairWater | `{4B47337C-05DC-4B9D-8068-2AD4DC7642F3}` | Created — add + variant |
| 6 | Solution cards | Three Column CTA | PentairWaterCards | `{B15B268E-EF04-4BCD-A97C-94CE052DE8FF}` | Created — add + variant |
| 7 | Video poster | Promo CTA | PentairWaterVideo | `{2B8C47F7-12BB-48AE-A086-CD91637B43A2}` | Created — add + variant |
| 8 | Partnerships heading | Heading CTA | PentairWater | `{7FF1FE36-F55D-49B9-9E25-A679F613AA05}` | Created — add + variant |
| 9 | Partner logos | Three Column CTA | PentairWaterLogos | `{973752EB-C624-4C1F-990B-F64B0E25CC18}` | Created — add + variant |
| 10 | View All | Heading CTA | PentairWaterOutline | `{9EC46D82-0426-4D5A-999E-A333BED045B2}` | Created — add + variant |
| 11 | Commitment | Promo CTA | PentairWaterStatement | `{DE3BFB0A-2A20-4414-95D0-B22A9D893242}` | Created — add + variant |
| 12 | Footer | Footer | PentairWater | Partial | Assign on partial |

## Theme

Applied in `src/assets/sass` as `.site-pentair`, mapped from site name `pentair-water`:

- Primary `#0c3471` · Secondary / accent `#008abc` (Bright Blue CTAs)
- Footer `#09244F` · Body `#464747`
- Fonts: Barlow Condensed (headings, weight 300/700) + Barlow (body)
- Buttons: radius 0; filled Bright Blue; outlined for View All

## Image Upload Summary

All 11 homepage images were uploaded to Content Hub (`jzi-verticals.sitecoresandbox.cloud`) and wired on datasources. See `images/image-manifest.json`.

Hero uses the desktop pouring-pitcher crop (`section2-img2.jpg`). Partnerships column 3 is the MSP airport logo (extractor alt said Vikings).

## Videos

Kitchen video file was not extracted. Poster is on `Pentair Water - Video`. See `manual-tasks.md`.

## Manual Tasks

Start with `manual-tasks.md` and `variant-checklist.md`.

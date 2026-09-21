# O-I homepage demo

Sitecore XM Cloud demo of [o-i.com](https://www.o-i.com/) on the Financial starter, with pixel-perfect **OI** variants.

**Content:** `/sitecore/content/manufacturing/o-i`  
**Datasources:** `/sitecore/content/manufacturing/o-i/Data`  
**Code:** `industry-verticals/o-i`  
**Theme:** dark `#171717`, gold `#FFD100`, Lato

## What was built

| # | Section | Component | Variant | Datasource |
|---|---------|-----------|---------|------------|
| 1 | Header | Header | OI | `OI Header` (partial) |
| 2 | News 2×2 | Four Column CTA | OINewsGrid | `OI News Grid` |
| 3 | Hero copy | Promo CTA | OIHero | `OI Hero Copy` |
| 4 | Vision / Innovation / Mission | Carousel | OI | Existing `Carousel - Default` (3 slides updated) |
| 5 | Power of Glass | Promo CTA | OIImageLeft | `OI Power of Glass` |
| 6 | Guided by Our Values | Promo CTA | OIValues | `OI Values` |
| 7 | Stay Connected | Heading CTA | OINewsletter | `OI Stay Connected` |
| 8 | Footer | Footer | OI | `OI Footer` (partial) |

Carousel **OI** is a dark split slider: gold eyebrow (first paragraph of Text), photo with gold border, circular gold CTA on the image, and **dots only** (no arrows) — matching the sustainability-vision screenshot.

Hero Banner was planned for the 50/50 news+copy row but is not in Available Renderings for `headless-main`. Promo **OIHero** carries that copy. Optional 50/50 steps are in `manual-tasks.md`.

## Theme

Brand variables are inlined in `src/app/globals.scss`. `layout.tsx` loads Lato via `next/font`.

## Images

11 assets uploaded to Content Hub (`jzi-verticals.sitecoresandbox.cloud`), approved, with public links on datasource Image fields.

## Next steps for you

1. Deploy / run the `o-i` rendering host so the new TSX variants load.
2. In Pages, select each OI variant (`docs/ai/demos/o-i/manual-tasks.md`).
3. Delete leftover PLAY! components listed in that file.
4. Assign Header / Footer datasources and OI variants on the partial designs.

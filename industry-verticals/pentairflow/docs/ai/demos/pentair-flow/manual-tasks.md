# Pentair Flow — Manual Tasks

## 1. Variant selection

See `variant-checklist.md`. Set every listed component to `PentairFlow` or `PentairFlowMuted`.

## 2. Assemble the page (API blocked)

`get_components_on_page` and `add_component_on_page` return HTTP 500 on Home (`ea63609e-f963-4885-9459-b09be41395ee`). The page reports `editablePlaceholders: []`.

Add these components in Pages on Home (or `/flow`) in this order, placeholder `headless-main`:

| Order | Component | Datasource |
|-------|-----------|------------|
| 1 | Hero | `/sitecore/content/pentair/pentair-flow/Home/Data/Pentair Flow - Hero` |
| 2 | Heading CTA | `.../Pentair Flow - Impact Heading` |
| 3 | Two Column CTA | `.../Pentair Flow - Impact Tiles` |
| 4 | Carousel | `.../Pentair Flow - Making an Impact` |
| 5 | Heading CTA | `.../Pentair Flow - Who We Serve Heading` |
| 6 | Promo CTA | `.../Pentair Flow - Commercial` |
| 7 | Promo CTA | `.../Pentair Flow - Industrial` |
| 8 | Promo CTA | `.../Pentair Flow - Residential` |
| 9 | Promo CTA | `.../Pentair Flow - Agriculture` |
| 10 | Heading CTA | `.../Pentair Flow - Resources Heading` |
| 11 | Five Column CTA | `.../Pentair Flow - Resources` |

Then assign Footer datasource `Pentair Flow - Footer` on the Footer partial.

## 3. Images

Playwright was not available, so images were not downloaded. Upload these to Content Hub and set the Image fields:

| Datasource | Field | Suggested asset |
|------------|-------|-----------------|
| Pentair Flow - Hero | Image | Golden agricultural field hero |
| Pentair Flow - Impact Tiles | Image1 | Water infrastructure / brochure visual |
| Pentair Flow - Impact Tiles | Image2 | Aerial industrial plant |
| Making an Impact children | Image | Story posters (NYC, Netherlands, New Orleans, St. Louis, F&B, Wastewater, Ag) |
| Commercial / Industrial / Residential / Agriculture | Image | Market photos from the live page |
| Pentair Flow - Footer | Image1 | White Pentair wordmark |

## 4. Header / Eyebrow

Update the Header partial: Pentair Flow logo, nav labels (Brands, Products, Resources, Sustainability, About), and the utility bar links.

## 5. Videos

Making an Impact videos stay manual. After posters are set, upload each story video and set the Carousel Item `Video` field.

## 6. Cleanup

Home still contains leftover PLAY! Financial pages (`personal`, `business`, `get-a-loan`, etc.). Hide or delete them when you are ready.

A placeholder page `/sitecore/content/pentair/pentair-flow/Home/flow` was created while diagnosing the Home layout 500. Delete it if unused.

## 7. Personalization (optional)

Duplicate datasources as `Pentair Flow - Hero - <Segment>` and assign conditions in Pages.

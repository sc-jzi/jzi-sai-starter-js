# Pentair Water — Manual Tasks

## 1. Assemble the page (API blocked)

`get_components_on_page` returns HTTP 500 on Home (`0fb75a4b-f18f-4f8a-9944-f0b48f786290`). `get_page` reports `editablePlaceholders: []`. `add_component_on_page` fails with 400 (duplicate name) or 500.

Add these components in Pages on Home, placeholder `headless-main`, **in this order**. Remove leftover Progressive / PLAY! Financial renderings first.

| Order | Component | Variant | Datasource |
|-------|-----------|---------|------------|
| 1 | Hero | PentairWater | `/sitecore/content/pentair/pentair-water/Data/Promos/Pentair Water - Hero` |
| 2 | Three Column CTA | PentairWaterIcons | `.../Pentair Water - Benefits` |
| 3 | Heading CTA | PentairWater | `.../Pentair Water - Solutions Heading` |
| 4 | Three Column CTA | PentairWaterCards | `.../Pentair Water - Solutions` |
| 5 | Promo CTA | PentairWaterVideo | `.../Pentair Water - Video` |
| 6 | Heading CTA | PentairWater | `.../Pentair Water - Partnerships Heading` |
| 7 | Three Column CTA | PentairWaterLogos | `.../Pentair Water - Partnerships` |
| 8 | Heading CTA | PentairWaterOutline | `.../Pentair Water - View All Partnerships` |
| 9 | Promo CTA | PentairWaterStatement | `.../Pentair Water - Commitment` |

Then assign Footer variant `PentairWater` on the Footer partial.

## 2. Variant selection

See `variant-checklist.md`.

## 3. Header / Eyebrow

The utility bar is baked into Header (`Default`, `WithLogoImage`, and `PentairWater`). Update the Header partial:

- Pentair Water Solutions logo
- Nav labels: Products, Top Brands, Our Impact, Investors
- Search placeholder on the right
- Hide the OOB Eyebrow rendering if it is still present

## 4. Video

The kitchen poster is already on `Pentair Water - Video`. Upload the source video to Content Hub, create a public link, and wire it after the poster (Promo CTA does not have a dedicated Video field in PLAY! — treat as a follow-up or BYOC if you need playback).

## 5. Footer content

Footer still uses the PLAY! / Progressive partial datasource. Replace copy, white wordmark, social icons, and legal links to match pentair.com.

## 6. Cleanup

Home still contains leftover PLAY! Financial pages: `personal`, `business`, `retirement-planning`, `Copy of articles`, `authors`, `get-a-loan`, `about-us`, `faqs`, `customer-support`. Hide or delete them when you are ready.

Promos folder still has Progressive datasources (`Progressive - Hero`, `Progressive - Products`, `Progressive - Stats`). Safe to leave or delete after the Water page is assembled.

Home page Title was updated to **Pentair Water Solutions**.

## 7. Personalization (optional)

Duplicate datasources as `Pentair Water - Hero - <Segment>` and assign conditions in Pages.

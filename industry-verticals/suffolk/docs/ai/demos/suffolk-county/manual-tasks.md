# Manual tasks — Suffolk County demo

## Page assembly (required)

`add_component_on_page` returned HTTP 500 for Home (`7c5e2ad1-8cd7-4c56-8f43-5a88030dd954`) and `get_components_on_page` / `get_page` reported empty placeholders. Assemble Home in Pages editor:

1. Open `/sitecore/content/public-sector/suffolk-county/Home`.
2. Remove leftover PLAY! Financial / starter-kit components from `headless-main` if present.
3. Add components in this order to `headless-main`, wire datasources, then set variants from `variant-checklist.md`:

| Order | Component | Datasource |
|------|-----------|------------|
| 1 | Heading CTA | Suffolk County - Alert Bar |
| 2 | Hero | Suffolk County - Hero |
| 3 | Heading CTA | Suffolk County - Quick Actions Intro |
| 4 | Three Column CTA | Suffolk County - Quick Actions Row 1 |
| 5 | Three Column CTA | Suffolk County - Quick Actions Row 2 |
| 6 | Carousel | Suffolk County - Promo Carousel |
| 7 | Four Column CTA | Suffolk County - Service Directory |
| 8 | Two Column CTA | Suffolk County - News and Events |
| 9 | Heading CTA | Suffolk County - Featured Intro |
| 10 | Five Column CTA | Suffolk County - Featured Services |

4. On each component, choose the **Suffolk** / **SuffolkAlert** / **SuffolkBand** / **SuffolkQuickActions** / **SuffolkDirectory** / **SuffolkNewsEvents** / **SuffolkFeatured** variant (see checklist).
5. Header and Footer live in partial designs. Set those renderings to the **Suffolk** variant and replace the logo with the county seal (`docs/ai/themes/suffolk-county/images/logo.png`, Content Hub asset 95777).

## Content leftovers

- Home item display name / title may still say **PLAY! Financial**.
- Starter article, loan, and finance pages under Home are unused for this demo; hide or delete in Content Editor if they pollute navigation.

## Search

Hero search chrome is visual only. Wiring to Sitecore Search is out of scope unless requested.

## Header / footer copy

Update header nav labels to Home, Government, Residents, Services, Business, Visiting and footer addresses:

- H. Lee Dennison Bldg, 100 Veterans Memorial Hwy, P.O. Box 6100, Hauppauge, NY 11788
- Riverhead County Center, County Road 51, Riverhead, NY 11901

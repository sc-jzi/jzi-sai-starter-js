# Métis Nation–Saskatchewan — Manual Tasks

## 1. Assemble the page (API blocked)

`get_components_on_page` returns HTTP 500 on Home (`58e0e383-4a67-43af-a83b-f9d8bdf57640`). `get_page` reports `editablePlaceholders: []`. `add_component_on_page` fails with 404 (missing Verticals branch for Carousel).

Add these components in Pages on Home, placeholder `headless-main`, **in this order**. Remove leftover PLAY! Financial renderings first.

| Order | Component | Variant | Datasource |
|-------|-----------|---------|------------|
| 1 | Carousel | Mns | `/sitecore/content/public-sector/mns/Data/Promos/MN-S - Hero Carousel` |
| 2 | Four Column CTA | MnsTiles | `.../MN-S - Quick Links Row 1` |
| 3 | Four Column CTA | MnsTiles | `.../MN-S - Quick Links Row 2` |
| 4 | Heading CTA | Mns | `.../MN-S - Featured Events Heading` |
| 5 | Three Column CTA | MnsEvents | `.../MN-S - Featured Events` |
| 6 | Heading CTA | MnsTextLink | `.../MN-S - View Full Calendar` |
| 7 | Heading CTA | Mns | `.../MN-S - Latest Stories Heading` |
| 8 | Four Column CTA | MnsStories | `.../MN-S - Latest Stories` |
| 9 | Heading CTA | MnsTextLink | `.../MN-S - All Stories` |
| 10 | CTA Banner | MnsSocials | `.../MN-S - Follow Connect` |
| 11 | Heading CTA | Mns | `.../MN-S - Affiliates Heading` |
| 12 | Four Column CTA | MnsLogos | `.../MN-S - Affiliates` |

Then assign variants on the partials (see `variant-checklist.md`).

## 2. Header / Eyebrow partials

Partials live at:

- `/sitecore/content/public-sector/mns/Presentation/Partial Designs/Header`
- Eyebrow is inside the header partial

Update them in Pages:

- Set Eyebrow variant to `Mns` (orange citizenship bar, no search)
- Set Header variant to `Mns` (navy bar + logo)
- Replace the Header `LogoImage` with the uploaded MN-S logo (Content Hub asset 97764 / `section7-img20.svg`)
- Add a Link List in the eyebrow placeholder: “Become an MN-S Citizen: Register today!” → https://mns.ca/metis-citizens/citizenship-registry
- Update nav labels: MN-S Government, Métis Citizens, Services & Programs, News, Library, Opportunities
- Search stays in the navy header if the existing Navigation / PreviewSearch is present

## 3. Footer partial

Partial: `/sitecore/content/public-sector/mns/Presentation/Partial Designs/Footer`

- Set variant to `Mns`
- Wire logo (`Image1`) to the same MN-S artwork
- Copy is already mapped in `content-map.yaml` section 15. Either update the existing Footer datasource or create `MN-S - Footer` under Promos and assign it:
  - Address: 310 20th Street East, Saskatoon, SK S7K 0A7
  - Phone: 1-877-METISSK (638-4775)
  - Links: Full Calendar, Newsletter, Privacy Policy, Contact Us
  - Copyright: All Contents ©2026 Métis Nation Saskatchewan

## 4. Missing images

| Item | Field | Notes |
|------|-------|-------|
| Quick Links Row 2 | Image4 | `banner-22.png` (Services & Programs tile) was not downloaded. Grab from https://mns.ca/uploads/banners/banner-22.png |
| Affiliates | Image1–4 | GDI, SMEDCO, CCDF, MACSI logos were not on the extracted homepage assets. Upload and set on `MN-S - Affiliates`. Until then the variant shows GDI / SMEDCO / CCDF / MACSI text fallbacks. |
| Social icons | — | CtaBanner has no dedicated social fields. `MnsSocials` renders Follow / Facebook · Instagram · LinkedIn / Connect. Swap in real icon links if you add them to the Footer social fields. |

## 5. Cleanup

Home still contains leftover PLAY! Financial pages: `personal`, `business`, `retirement-planning`, `articles`, `authors`, `get-a-loan`, `about-us`, `faqs`, `customer-support`. Hide or delete them when you are ready.

Home page Title was updated to **Métis Nation–Saskatchewan**.

## 6. Theme

Restart the mns rendering host after pull so `.site-mns` tokens and `_component-mns.scss` load. Site name `mns` maps to `site-mns` in `src/lib/site-theme.ts`.

## 7. Personalization (optional)

Duplicate datasources as `MN-S - <Component> - <Segment>` and assign conditions in Pages.

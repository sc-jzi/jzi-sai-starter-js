# Manual tasks — Dwyer Omega

## Select variants

See `variant-checklist.md`. Header, Eyebrow, and Footer live on partial designs, so set those variants on the partials, not only on Home.

## Remove PLAY! leftovers from Home

These were already on the page and cannot be removed through the API. Delete them in Pages so they sit below the new sections:

- Carousel
- Five Column CTA
- Three Column CTA
- The original Promo CTA instances (keep **Help is here** and **Find out who we are**)
- The original Two Column CTA (keep **RESOURCES / NEWSLETTER**)
- Article List
- Documents List
- App Promo

## Assign the footer

On the footer partial, set the datasource to `/sitecore/content/Financial/dwyeromega/Data/Footers/Dwyer Omega - Footer` and the variant to DwyerOmega.

## Replace images

The live site blocked image download. Product, industry, hero, help, and story images are empty or still the PLAY! standard-values photos. Upload:

- Hero product photo
- 12 featured product photos
- Six industry card photos (Beverage, Food, Medical, Cold Chain, Aerospace, Read our Blog)
- Help specialist photo
- Factory / story photo
- Header logo

## Header navigation

The DwyerOmega header paints the navy bar and logo. The red All Products control and the six nav items still come from the header navigation items in the partial. Restyle or replace those links so All Products is the red pill.

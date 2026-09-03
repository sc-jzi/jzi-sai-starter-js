# Covista — Manual Tasks

## 1. Assign rendering variants

See `variant-checklist.md`. MCP cannot set `FieldNames` on existing instances. Stock and News Stories already have Covista variants.

## 2. Header partial

Partial: `/sitecore/content/covista/covista/Presentation/Partial Designs/Header`

- Set Header variant to `Covista` (`{CD484102-E1B8-449B-9851-BAB6FC97F142}`)
- `LogoImage` is already the uploaded Covista wordmark (Content Hub asset 83818)
- Hide or remove the PLAY! "LAY! finance" RichText in `header-left`
- Hide the Eyebrow (theme switcher / language switcher) — live Covista has no eyebrow bar
- Update Navigation labels: Our Story, Our Institutions, Our Impact, Join Us, Investors, News & Insights

## 3. Footer partial

Partial: `/sitecore/content/covista/covista/Presentation/Partial Designs/Footer`

- Set Footer variant to `Covista` (`{B95250EB-1A5C-4D9B-9C85-21CF3A70D4B3}`)
- Copy and logo are already on `Footer 1` (Chicago address, four link columns)
- Optional: point socials at Covista LinkedIn / Facebook / YouTube

## 4. Carousel datasource

`set_component_datasource` fails on Carousel (missing Verticals branch). In Pages:

- Assign datasource `/sitecore/content/covista/covista/Data/Promos/Covista - Hero Carousel`
- Set variant `Covista`
- Child slide `Covista - Hero Slide 1` already has title, CTA, and hero image
- Optional: upload `https://www.covista.com/sites/g/files/krcnkv471/files/2026-01/header_final.mp4` onto the slide Video field

## 5. Add missing sections if they are not on the canvas

`add_component_on_page` created datasources for Stats and both institution headings, but they did not always appear in `get_components_on_page`. If they are missing, add them to `headless-main` in this order:

| After | Component | Variant | Datasource |
|-------|-----------|---------|------------|
| Carousel | Stats Counter | CovistaCards | `Home/Data/Covista_Stats` or `Data/Promos/Covista - Stats` |
| before Five Column CTA | Heading CTA | Covista | `Home/Data/Covista_Institutions_Heading` |
| Five Column CTA | Heading CTA | CovistaLink | `Home/Data/Covista_Institutions_Learn_More` |
| after News Stories | Heading CTA | CovistaLink | `Home/Data/Covista_News_More_Stories` (`ec0acb59-…`) |

Five Column CTA still points at the PLAY! institutions item. Rewire to `/sitecore/content/covista/covista/Data/Promos/Covista - Institutions`.

## 6. Cleanup leftover PLAY! Financial renderings

MCP cannot delete components. Remove these from Home when you are ready:

| Component | Instance ID |
|-----------|-------------|
| Empty Four Column CTA (nested row) | `09cfd835-87f6-4d58-9681-9c6ea1a3228b` |
| Comparison (left) | `654c4b49-b268-4ea3-a123-7a2162fa9ecc` |
| Comparison (right) | `36e87c5b-94df-4c70-827e-e88dccd07907` |
| Three Column CTA | `d54d53b4-1aa4-4998-9bdf-eb934c32cfb6` |
| Two Column CTA | `0ed2d2c2-e9ef-4e40-b040-6289cb174e03` |
| Article List | `854de8ce-208f-494d-b7c8-c1162d00144f` |
| Documents List | `251b0936-4659-4127-9952-52ca5140d803` |
| App Promo | `7ebe6f29-1c6f-4138-8bf9-287acf0cd530` |

Also hide leftover banking child pages (`personal`, `business`, `get-a-loan`, etc.).

Home Title is already **Covista**.

## 7. Theme

Restart the covista rendering host so `.site-covista` tokens and `_component-covista.scss` load. Site name `covista` maps to `site-covista` in `src/lib/site-theme.ts`.

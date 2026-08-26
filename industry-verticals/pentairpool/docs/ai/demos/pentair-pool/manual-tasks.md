# Manual Tasks — Pentair Pool Home

Page layout reads/writes via the Agent API returned HTTP 500 on 2026-08-25 (`get_components_on_page`, `add_component_on_page`). Datasources, variant definition items, theme, and React variants are already in place.

## 0. Deploy the front end

From `industry-verticals/pentairpool`:

```bash
npm install
npm run dev
```

Named exports (`PentairPool`, `PentairPoolIntro`, `PentairPoolSplit`, and the rest) are picked up when the component map regenerates. Restart the rendering host after pull.

## 1. Add missing components (Pages → Home → Main)

Placeholder: `headless-main`. Insert **above** leftover Financial / Progressive components when possible.

| Order | Rendering | Datasource | Variant |
|-------|-----------|------------|---------|
| 1 | **Hero** `{B7CDF75E-716A-4C59-B9B1-CD970AE0A4AE}` | `Data/Promos/Pentair Pool - Hero` `{BB6CDAA6-1135-4C62-B87E-5AF8C218B76E}` | PentairPool |
| 2 | **Heading CTA** `{89E1D547-7CD6-4EF0-9A27-1E99410797DD}` | `Pentair Pool - Intro` `{E9DABD56-A2B4-4DD0-9E99-B08C05EA54FF}` | PentairPoolIntro |
| 3 | **Four Column CTA** `{35075000-760E-4FF3-BD1C-F2EEBA251DCB}` | `.../Four Column CTA/Pentair Pool - Featured Products` `{D00B6144-E6CC-4901-990C-1C72634C48C1}` | PentairPoolProducts |
| 4 | **Two Column CTA** `{3A9A9D22-C092-4B54-9511-EB202CEABE8D}` | `.../Two Column CTA/Pentair Pool - Personas` `{D517C85A-9540-4FA5-BA0D-2206776D071E}` | PentairPoolPersonas |
| 5 | **Five Column CTA** `{333DEF3E-C272-4AD9-A493-8D5CCAE08312}` | `.../Five Column CTA/Pentair Pool - Resources` `{9761C217-72B3-4F0D-8486-9D53D6CAB101}` | PentairPoolResources |
| 6 | **Heading CTA** | `Pentair Pool - Solutions Heading` `{F6E1F662-4CE3-400F-9502-1AF97810A5C9}` | PentairPoolSolutionsHead |
| 7 | **Promo CTA** `{1A375FAC-6CC1-4A5A-A159-9BC6DBC66B80}` | `.../Promo CTA/Pentair Pool - Pumps` `{D3E27E6D-D9D9-4781-8301-2D528A966598}` | PentairPoolSplit |
| 8 | **Promo CTA** | `Pentair Pool - Automation` `{A3C72F19-7F64-4016-86AD-98B16A1D176B}` | PentairPoolSplitAlt |
| 9 | **Promo CTA** | `Pentair Pool - Lighting` `{2D779513-1ABE-42A4-A1E1-0ED675E18E4A}` | PentairPoolSplit |
| 10 | **Promo CTA** | `Pentair Pool - Filtration` `{B1CFDF96-469A-4B49-B325-25555C4773BF}` | PentairPoolSplitAlt |
| 11 | **Promo CTA** | `Pentair Pool - Heating` `{553790B1-AB2C-4816-8B20-4A2163C53CD2}` | PentairPoolSplit |
| 12 | **Promo CTA** | `Pentair Pool - Treatment` `{94AB0171-D35F-4384-8950-4CC13AC1144A}` | PentairPoolSplitAlt |
| 13 | **Four Column CTA** | `Pentair Pool - More Products 1` `{CDE3370F-7FB7-45EE-B23E-13D582BF5BC6}` | PentairPoolIcons |
| 14 | **Four Column CTA** | `Pentair Pool - More Products 2` `{C1351B94-843C-4F6D-91BC-F84821FCECB0}` | PentairPoolIcons |
| 15 | **Two Column CTA** | `Pentair Pool - Rebates` `{07E1220B-A8E1-49A7-B7FE-8E35A855BBC7}` | PentairPoolPartners |
| 16 | **CTA Banner** `{488B8AC0-0EF9-4F6F-8711-78BA182B2C4C}` | `Pentair Pool - Understand Equipment` `{5FB65017-652E-481E-8B5C-6A061FE9B50F}` | PentairPoolEdu |
| 17 | **CTA Banner** | `Pentair Pool - Find a Dealer` `{F7BC604F-C3C5-4347-96B0-4AED231653D6}` | PentairPoolDealer |
| 18 | **App Promo** `{F9905F68-21E8-4C6F-8B89-56BB99020D31}` | `.../App Promos/Pentair Pool - App` `{B2241EAF-ECB6-4FA8-802F-B20CB78F6AB8}` | PentairPoolApp |

If Heading CTA, Two Column CTA, Five Column CTA, CTA Banner, or App Promo are missing from the insert list, add them under **Presentation → Available Renderings** for the pentairpool site.

## 2. Header and Footer (partial designs)

These cannot be added via `add_component_on_page`.

| Component | Action |
|-----------|--------|
| Header | Open the Header partial (`headless-header`). Set variant **PentairPool** `{BCD2F504-EB31-444B-ADAE-B8FC9A619D92}`. Optional: set LogoImage to the Pentair Pool wordmark. |
| Footer | Open the Footer partial (`headless-footer`). Set variant **PentairPool** `{55ADF8DE-3F3A-4945-889A-F199A3F01155}`. Assign datasource `Data/Promos/Pentair Pool - Footer` `{8084C099-5BA0-4347-8281-31A9596769AC}`. |

## 3. Variant selection

See `variant-checklist.md`. Variants do not render until the rendering host has the new named exports.

## 4. Cleanup leftover starter / Progressive components

Remove or hide leftover Financial and Progressive items from Home `headless-main` (and nested placeholders). Do **not** delete shared Pentair Pool items under `Data/Promos`.

A failed add may have created a local `Hero` item under `Home/Data`. Delete local orphans only — keep `Data/Promos/Pentair Pool - Hero`.

## 5. Hero video (optional)

Live hero is a ~50MB water GIF. The datasource uses still poster `section5-img39.jpg`. To match the live motion:

1. Compress the GIF or convert to MP4
2. Upload to Content Hub and create a public link
3. Swap the Hero Image or add a background video in Pages

## 6. Personalization (optional)

Featured products and the professional vs new-owner tiles are good candidates for audience variants once the default page looks right.

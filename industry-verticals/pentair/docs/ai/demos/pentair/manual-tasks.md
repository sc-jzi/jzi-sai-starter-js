# Manual Tasks — Pentair Home

Page layout writes via the Agent API returned HTTP 500 on 2026-08-25, so assembly must be finished in Pages. Datasources, variant definition items, theme, and React variants are already in place.

## 0. Deploy the front end

From `industry-verticals/pentair`:

```bash
npm install
npm run dev
```

Named exports (`Pentair`, `PentairAlt`, `PentairSpotlight`) are picked up when the component map regenerates. Restart the rendering host after pull.

## 1. Add missing components (Pages → Home → Main)

Placeholder: `headless-main`. Insert **above** leftover Financial components when possible.

| Order | Rendering | Datasource | Variant |
|-------|-----------|------------|---------|
| 1 | **Hero** (`b7cdf75e-716a-4c59-b9b1-cd970ae0a4ae`) | `Data/Promos/Pentair - Hero` `{5501351D-509B-4FFB-9D27-B15C55DA5520}` | Pentair |
| 2 | **Three Column CTA** (reuse existing `{D54D53B4-1AA4-4998-9BDF-EB934C32CFB6}`) | `.../Three Column CTA/Pentair - Move Improve Enjoy` `{847002A3-A38D-41C3-8AC8-479095D0C44A}` | Pentair |
| 3 | **Three Column CTA** (add new) | `.../Pentair - Sustainability Spotlight` `{4F12A29B-4C18-426B-97E0-D7A0514C6B29}` | PentairSpotlight |
| 4 | **Promo CTA** (reuse `{633506E7-54D0-4410-9051-72FB4C9FECB4}`) | `.../Pentair - Careers` `{2007DA69-3D69-415F-A60C-3A9EFC691303}` | Pentair |
| 5 | **Promo CTA** (reuse `{1A516B9B-CC7C-49C9-A8EB-5BE281A98612}`) | `.../Pentair - Innovation mySudmo` `{89B4E519-4251-4BAD-870D-E75ABB4C068B}` | Pentair |
| 6 | **Promo CTA** (add new) | `.../Pentair - Innovation Everpure` `{09A7A6B2-66E0-4E29-8269-0FA637BA164B}` | PentairAlt |
| 7 | **Promo CTA** (add new) | `.../Pentair - Innovation IntelliFlo3` `{937026FF-2CE7-45F4-818B-CC35D4563888}` | Pentair |
| 8 | **Heading CTA** (add new — see §1a) | `.../Pentair - News Releases` `{7957887F-2051-46D6-B30F-CE8CACE7199B}` | Pentair |

### 1a. Heading CTA is not in Available Renderings

`get_allowed_comps_by_ph` for `headless-main` does **not** include Heading CTA (`89e1d547-7cd6-4ef0-9a27-1e99410797dd`).

In Content Editor: **Presentation → Available Renderings** for the pentair site, add **Heading CTA**, then add it on Home.

## 2. Header and Footer (partial designs)

These cannot be added via `add_component_on_page`.

| Component | Action |
|-----------|--------|
| Header | Open the Header partial (`headless-header`). Set variant **Pentair** `{74BAD22A-5D1F-48C6-8DCC-2D050A6F3265}`. Optional: set LogoImage to the Pentair wordmark. |
| Footer | Open the Footer partial (`headless-footer`). Set variant **Pentair** `{F5628DA9-09E3-4F2B-B4F3-36347D5B8DCF}`. Assign datasource `Data/Promos/Pentair - Footer` `{C47B0E77-C3B0-4C1B-83FA-ACD5004137A9}`. Add a reversed white logo to Image1 if missing. |

## 3. Variant selection

See `variant-checklist.md`. Variants do not stick until the rendering host has the new named exports.

## 4. Cleanup leftover Financial components

Remove or hide these from Home `headless-main` (and nested placeholders):

- Carousel `{124106DE-FB02-4B43-A521-A309FC75A5BC}`
- Promo CTA (local `/Data/Promo CTA 1`) `{D49A8931-F041-4988-9CC3-F2400E6422D0}`
- Five Column CTA `{B882746C-C313-4283-8F58-B9402BCF9C6A}`
- Two Column CTA `{0ED2D2C2-E9EF-4E40-B040-6289CB174E03}` (contains Comparison ×2 and Four Column CTA)
- Article List `{854DE8CE-208F-494D-B7C8-C1162D00144F}`
- Documents List `{251B0936-4659-4127-9952-52CA5140D803}`
- App Promo `{7EBE6F29-1C6F-4138-8BF9-287ACF0CD530}`

Optional: delete leftover local items under `Home/Data` named `Hero` and `Hero 1` (created by a failed add). Do **not** delete shared Pentair items under `Data/Promos`.

## 5. Link verification

Datasource CTAs point at pentair.com (and mysudmo.pentair.com). Confirm they open correctly from the published site.

## 6. Personalization (optional)

Careers and Innovation Spotlight are good candidates for geo or industry personalization once the default page looks right.

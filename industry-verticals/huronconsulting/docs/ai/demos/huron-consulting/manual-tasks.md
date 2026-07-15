# Huron Consulting Demo — Manual Assembly Tasks

Complete these steps in **Pages** or **Content Editor** for `/sitecore/content/consulting/huronconsulting/Home`.

Automated page assembly could not wire the Home layout (Agent API limitation — same as Quanex/Progressive demos). All datasources, variants, and theme code are ready.

## Page setup

1. Set page **Title** field to `Huron` (API update returned 500)
2. Remove or hide leftover starter / Progressive sections not needed for the demo
3. Restart the huronconsulting rendering host after pulling code so new variants load:

```bash
cd industry-verticals/huronconsulting
npm run dev
```

## Recommended component order (top → bottom)

| # | Component | Variant | Datasource |
|---|-----------|---------|------------|
| 1 | Hero | Huron | `/Data/Promos/Huron - Hero` |
| 2 | Heading CTA | HuronChallenges | `/Data/Promos/Promo CTA/Huron - Challenges` |
| 3 | Promo CTA | Huron | `/Data/Promos/Promo CTA/Huron - Meet the Moment` |
| 4 | Heading CTA | Huron | `/Data/Promos/Promo CTA/Huron - Transformation Intro` |
| 5 | Four Column CTA | HuronTransformation | `/Data/Promos/Four Column CTA/Huron - Transformation Pillars` |
| 6 | CTA Banner | Huron | `/Data/Promos/Huron - Health Care Event` |
| 7 | Heading CTA | Huron | `/Data/Promos/Promo CTA/Huron - Insights Intro` |
| 8 | Three Column CTA | HuronInsights | `/Data/Promos/Three Column CTA/Huron - Insights` |
| 9 | CTA Banner | HuronConnect | `/Data/Promos/Huron - Lets Connect` |

Placeholder: `headless-main`

## Partial designs

- **Header** partial: set variant to **Huron**; update nav labels to What We Do / How We Think / Who We Are / Careers
- **Footer** partial: set variant to **Huron**; update mission copy, link columns, social, copyright for Huron

## Variant GUIDs (FieldNames parameter)

| Component | Variant | Item ID |
|-----------|---------|---------|
| Hero | Huron | `{4D1FE21D-AC2D-4BA0-B165-C81F52C24E06}` |
| HeadingCta | Huron | `{F672DF61-260C-48AD-A2EA-C450EBA29BFB}` |
| HeadingCta | HuronChallenges | `{756B8DE7-BC8A-4056-95EA-CBB9B022F3B6}` |
| Promo CTA | Huron | `{B829F9B7-7B6C-43A1-A78F-B1344385B3C7}` |
| FourColumnCta | HuronTransformation | `{A5898AE8-BB71-4679-92B2-46768AA6C8D9}` |
| CtaBanner | Huron | `{BBD13E5B-FDD6-4692-8C75-2626996353AB}` |
| CtaBanner | HuronConnect | `{42F45117-96D0-4151-A026-9AAB9BCD3334}` |
| ThreeColumnCta | HuronInsights | `{AD5805AD-348C-4650-8391-F65091BDBB05}` |
| Header | Huron | `{A89B0934-0AD7-4480-BB7D-9EC4E9343A71}` |
| Footer | Huron | `{950B2BEE-9ECC-43BA-9421-7904D082D1CA}` |

## Images

Content Hub upload was skipped. Local files are in `docs/ai/demos/huron-consulting/images/`. Assign media in Content Editor / Content Hub when ready:

| File | Target datasource | Field |
|------|-------------------|-------|
| `section1-img1.jpg` | Huron - Hero | Image |
| `section3-img2.jpg` | Huron - Meet the Moment | Image |
| `section4-img4.jpg` … `img7.jpg` | Huron - Transformation Pillars | Image1–4 |
| `section5-img8.jpg` | Huron - Health Care Event | Image |
| `section6-img9.jpg` | Huron - Insights | Image1 (+ optional Image2/3) |

See also `images-to-upload.md`.

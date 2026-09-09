# Quorum Software — Rendering Variant Checklist

Set these in Pages: select the component → Content/Design panel → choose the variant.

The Agent API **cannot** set rendering variants. Its `set_component_datasource` has a `variantId` parameter, but that refers to page-level personalization variants (page flows / AB tests) and returns `Variant '<id>' not found on this page` for a rendering variant definition. The variant lives in the `FieldNames` rendering parameter, which the API does not expose. So this is a manual pass.

Page: `/sitecore/content/utilities/quorum/Home` (`ca1354be-b122-4a0f-a8f6-6907a7caa77d`), version 2.

## Home page components, in order

| # | Component | Instance ID | Set variant to | Variant ID |
|---|-----------|-------------|----------------|-----------|
| 1 | Hero | `a0ca3f16-e610-4671-b863-fef083e34f07` | `Quorum` | `{05CAF617-3A8C-4DB5-8FD7-A0DEAE1B7C12}` |
| 2 | Heading CTA | `ff9dd652-2624-441c-b4fc-de00244d1e95` | `QuorumSectionHeading` | `{33C10FA9-FA7E-4C82-8B2B-322C35C9BC04}` |
| 3 | Three Column CTA | `2af5f0b8-a31b-4fef-ac17-fc4c0b88842b` | `QuorumDecisionCards` | `{90050E70-7000-4C72-B7EF-41F3822AE1D2}` |
| 4 | Three Column CTA | `951e9a8c-afc3-4b2c-823d-344a01b6ddb9` | `QuorumDecisionCards` | `{90050E70-7000-4C72-B7EF-41F3822AE1D2}` |
| 5 | Heading CTA | `1d187f95-2518-432d-b4d0-699deb0f10fc` | `QuorumSectionHeading` | `{33C10FA9-FA7E-4C82-8B2B-322C35C9BC04}` |
| 6 | Three Column CTA | `d9d0dc43-a6b9-4809-bb01-81d395703ace` | `QuorumCustomerStories` | `{A1E36F0B-2327-40E3-A553-D511F568E798}` |
| 7 | Promo CTA | `e2dd9bff-2ae7-416e-8c0f-5abadbb4be9c` | `QuorumDarkBanner` | `{B6B4A818-7600-46BA-A8E2-783FD4868DA8}` |
| 8 | Heading CTA | `da64d825-448d-4962-ad4b-e6f98eb182d4` | `QuorumInlineCta` | `{C00D6B13-8634-4814-9917-F432AF297FE1}` |
| 9 | Heading CTA | `c883baaf-ec2c-4793-aa14-dc2cdce2bb8a` | `QuorumSectionHeading` | `{33C10FA9-FA7E-4C82-8B2B-322C35C9BC04}` |
| 10 | Three Column CTA | `078c961e-b040-4b42-9663-ea73d620a78b` | `QuorumTopStories` | `{1BCA7812-8FC5-456D-A961-3A2CB666D0A2}` |
| 11 | App Promo | `247f12f1-adb7-42c8-a323-e35877e2f88f` | `QuorumGuide` | `{F6BD88DC-93D7-483A-8CC5-E7AEA43984E6}` |
| 12 | Heading CTA | `2415ef42-353f-4ae2-97a6-60002e370336` | `QuorumFinalCta` | `{593471CF-1696-436E-9AB0-0E51CD101228}` |

> [!IMPORTANT]
> Item 11 (App Promo) is currently set to the **`Hidden`** variant (`{1D2920AE-671D-4645-A127-5A8F28A0101E}`) and will render nothing until you change it to `QuorumGuide`. Every other row is currently on `Default`.

## Partial designs

| Partial | Component | Instance ID | Set variant to | Variant ID |
|---------|-----------|-------------|----------------|-----------|
| Header (`25d8a12a-…`) | Header | `c494869c-a931-4f42-8bdf-aca32462f2b3` | `Quorum` | `{77F7F717-978B-4343-8ECA-7E64434A0DBA}` |
| Footer (`9f90c4d9-…`) | Footer | `29758c1f-8daf-4d56-a212-eb734e2907ae` | `Quorum` | `{95DF9AC7-F5CF-4F40-81BE-3B39C7216487}` |

## All registered Quorum variants

Every variant below is a named export in the matching component file. The variant item name and the export name must stay identical — that string is how the Content SDK resolves which export to render.

| Component file | Export | Variant item |
|----------------|--------|-------------|
| `navigation/Header.tsx` | `Quorum` | Header/Quorum |
| `navigation/Footer.tsx` | `Quorum` | Footer/Quorum |
| `pagecontent/Hero.tsx` | `Quorum` | Hero/Quorum |
| `pagecontent/HeadingCta.tsx` | `QuorumSectionHeading` | Heading CTA/QuorumSectionHeading |
| `pagecontent/HeadingCta.tsx` | `QuorumInlineCta` | Heading CTA/QuorumInlineCta |
| `pagecontent/HeadingCta.tsx` | `QuorumFinalCta` | Heading CTA/QuorumFinalCta |
| `pagecontent/ThreeColumnCta.tsx` | `QuorumDecisionCards` | Three Column CTA/QuorumDecisionCards |
| `pagecontent/ThreeColumnCta.tsx` | `QuorumCustomerStories` | Three Column CTA/QuorumCustomerStories |
| `pagecontent/ThreeColumnCta.tsx` | `QuorumTopStories` | Three Column CTA/QuorumTopStories |
| `pagecontent/PromoCta.tsx` | `QuorumDarkBanner` | Promo CTA/QuorumDarkBanner |
| `pagecontent/AppPromo.tsx` | `QuorumGuide` | App Promo/QuorumGuide |
| `pagecontent/ArticleList.tsx` | `QuorumTopStories` | Article List/QuorumTopStories |

## `Hidden` variants

`Carousel`, `PromoCta`, `FiveColumnCta`, `ThreeColumnCta`, `TwoColumnCta`, `ArticleList`, `DocumentsList`, and `AppPromo` each export a `Hidden` variant that renders nothing. Use it when you want to suppress a leftover instance without deleting it. It is opt-in: nothing renders `Hidden` unless you select it.

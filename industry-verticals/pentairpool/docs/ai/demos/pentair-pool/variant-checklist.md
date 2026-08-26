# Variant Selection Checklist — Pentair Pool

Open **Home** (`/sitecore/content/pentair/pentairpool/Home`) in Pages. Click each component, open the **Design** tab, and set the variant.

Site name in preview is `pentairpool` (maps to `site-pentairpool`).

| # | Component | Needed | Variant ID |
|---|-----------|--------|-----------|
| 1 | Header (partial) | **PentairPool** | `{BCD2F504-EB31-444B-ADAE-B8FC9A619D92}` |
| 2 | Hero | **PentairPool** | `{96155709-11C5-4B8D-ACF6-1396B63BEAA5}` |
| 3 | Heading CTA (Intro) | **PentairPoolIntro** | `{7B8F4A75-F490-457C-9C0B-4BDE30ADC6DD}` |
| 4 | Four Column CTA (Featured Products) | **PentairPoolProducts** | `{F6DADA37-95E5-4981-96B9-6954613224C0}` |
| 5 | Two Column CTA (Personas) | **PentairPoolPersonas** | `{E6F09C1A-DC11-4840-A5ED-90319DBA1C72}` |
| 6 | Five Column CTA (Resources) | **PentairPoolResources** | `{7A56587A-6A29-492F-BAC2-C6D979EEE7A2}` |
| 7 | Heading CTA (Pool Solutions) | **PentairPoolSolutionsHead** | `{71E45BB5-C560-47D3-AFDC-F1BD871EA68E}` |
| 8 | Promo CTA (Pumps) | **PentairPoolSplit** | `{AEA3CA1F-32C7-4B58-8952-0DAB4DCA3BBB}` |
| 9 | Promo CTA (Automation) | **PentairPoolSplitAlt** | `{9B64DD48-FA8C-4061-BDC9-6D6BA6931CBF}` |
| 10 | Promo CTA (Lighting) | **PentairPoolSplit** | `{AEA3CA1F-32C7-4B58-8952-0DAB4DCA3BBB}` |
| 11 | Promo CTA (Filtration) | **PentairPoolSplitAlt** | `{9B64DD48-FA8C-4061-BDC9-6D6BA6931CBF}` |
| 12 | Promo CTA (Heating) | **PentairPoolSplit** | `{AEA3CA1F-32C7-4B58-8952-0DAB4DCA3BBB}` |
| 13 | Promo CTA (Treatment) | **PentairPoolSplitAlt** | `{9B64DD48-FA8C-4061-BDC9-6D6BA6931CBF}` |
| 14 | Four Column CTA (More Products 1) | **PentairPoolIcons** | `{22345C4B-83E5-44C6-A282-9432D38F9070}` |
| 15 | Four Column CTA (More Products 2) | **PentairPoolIcons** | `{22345C4B-83E5-44C6-A282-9432D38F9070}` |
| 16 | Two Column CTA (Rebates) | **PentairPoolPartners** | `{02B8C221-8867-4D75-AF16-B6AFE2944D01}` |
| 17 | CTA Banner (Understand Equipment) | **PentairPoolEdu** | `{92C53245-E80D-404F-B22E-944B5453B86E}` |
| 18 | CTA Banner (Find a Dealer) | **PentairPoolDealer** | `{563FC2AA-9FB2-4E36-A3D0-B8E1FBA2716A}` |
| 19 | App Promo | **PentairPoolApp** | `{549C9DF0-EDDC-4285-9239-0DF3314624B4}` |
| 20 | Footer (partial) | **PentairPool** | `{55ADF8DE-3F3A-4945-889A-F199A3F01155}` |

Steps per component:

1. Click the component on the canvas
2. In the right-hand pane, open the Design tab
3. Select the variant from the dropdown (name must match the TSX export exactly)
4. Repeat for the next component

**Restart the rendering host** after pull so named exports land in `.sitecore/component-map.ts`.

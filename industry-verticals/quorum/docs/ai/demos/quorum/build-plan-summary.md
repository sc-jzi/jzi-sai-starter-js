# Quorum Software — Build Plan

> **Source:** https://www.quorumsoftware.com/
> **Target:** `/sitecore/content/utilities/quorum/Home`
> **Sections:** 12 component steps using the existing Quorum starter renderings

## Page sections

| # | What's on the page | What we'll use | Proposed variant | Confidence |
|---|---|---|---|---|
| 1 | _Qnect announcement and two-tier corporate navigation_ | Header | Quorum | High |
| 2 | _Oilfield hero with blue overlay and orange CTA_ | Hero | Quorum | High |
| 3 | _Centered “Built for Connected Decisions” heading_ | Heading CTA | QuorumSectionHeading | High |
| 4 | _First row of three capability cards_ | Three Column CTA | QuorumDecisionCards | High |
| 5 | _Second row of three capability cards_ | Three Column CTA | QuorumDecisionCards | High |
| 6 | _Tallgrass, Saturn, and Woodside customer stories_ | Three Column CTA | QuorumCustomerStories | High |
| 7 | _Dark Qnect 26 event banner_ | Promo CTA | QuorumDarkBanner | High |
| 8 | _Compact “Unleash Your Data” conversion strip_ | Heading CTA | QuorumInlineCta | High |
| 9 | _Three Top Stories in Energy cards_ | Three Column CTA | QuorumTopStories | High |
| 10 | _Full-width oil-and-gas planning guide banner_ | App Promo | QuorumGuide | High |
| 11 | _Minimal “Ready to get started?” prompt_ | Heading CTA | QuorumFinalCta | High |
| 12 | _Navy four-column footer with legal and social links_ | Footer | Quorum | High |

## Variant decisions

The existing renderings have suitable content fields, but their current markup does not match Quorum's visual system. Pixel-perfect mode will add named Quorum variants for the full-bleed hero, navy title-bar cards, compact inline CTA, editorial cards, guide banner, and global header/footer.

The six connected-decision cards are intentionally split across two Three Column CTA instances. This preserves every card as individually editable Sitecore content without introducing a new rendering or template.

## Components by type

Automatically addable and wireable:
- Hero
- Heading CTA (three uses)
- Three Column CTA (four uses)
- Promo CTA
- App Promo

Partial-design components:
- Header
- Footer

No new component renderings or templates are required.

## Content strategy

- Create new Quorum-specific datasource items; do not overwrite starter examples.
- Store every CTA-style datasource in its respective component folder beneath `/sitecore/content/utilities/quorum/Data/Promos`.
- Use the existing `Promo CTA`, `Three Column CTA`, and `App Promos` folders.
- Create missing `Hero` and `Heading CTA` folders beneath `Data/Promos` with the existing `Promo Folder` template.
- Keep article items beneath `/sitecore/content/utilities/quorum/Home/articles`.
- Download source imagery, upload it to Content Hub, and wire DAM image XML into the new datasources.
- Keep navigation labels, footer columns, links, and campaign copy editable in Sitecore.

## Assembly note

The Home page currently contains ten starter renderings. The approved sequence will reuse safe matches where possible and add the required Quorum instances. Because the Agent API does not expose component deletion, any obsolete starter renderings that cannot be repurposed will be listed for manual removal.

## Build order

1. Extract exact source copy and imagery.
2. Create Quorum datasource and article items.
3. Apply the Quorum theme.
4. Add the approved named variants.
5. Assemble and wire the Home page.
6. Verify desktop/mobile rendering and provide a manual cleanup checklist.

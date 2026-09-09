# Quorum Software — Manual Tasks

Page: `/sitecore/content/utilities/quorum/Home` (`ca1354be-b122-4a0f-a8f6-6907a7caa77d`), **version 2**, language `en`.

All Quorum content lives under `/sitecore/content/utilities/quorum`. All code lives in `./industry-verticals/quorum`.

## 1. Assign rendering variants

**See `variant-checklist.md`** for the full table of instance IDs and variant GUIDs.

The Agent API cannot set rendering variants — the variant lives in the `FieldNames` rendering parameter, which the API does not expose. Assign them in Pages.

Every component currently renders its `Default` variant, except the App Promo, which is on `Hidden` and renders nothing until you set it to `QuorumGuide`.

## 2. Deploy the rendering host

The Quorum styling (`src/assets/sass/components/_component-quorum.scss`, brand tokens in `abstracts/vars/_colors.scss`) only appears once the head application is rebuilt and deployed. Until then, Pages renders the starter's PLAY! Finance styling.

For local verification, set `SITECORE_EDGE_CONTEXT_ID` (plus `NEXT_PUBLIC_DEFAULT_SITE_NAME` and `SITECORE_EDITING_SECRET`) in `industry-verticals/quorum/.env.local`, then run `npm run dev`. Without it the dev server fails with `[MV-007] Provide either "contextId" or both "apiHost" and "apiKey"`.

## 3. Header partial design

Partial: `/sitecore/content/utilities/quorum/Presentation/Partial Designs/Header` (`25d8a12a-d24c-4715-a3fe-276c2fa9671b`)

Already done: `LogoImage` is the uploaded Quorum wordmark, and the Qnect 26 announcement strip is a RichText item (`9f0db03e-ad8a-413b-963d-910731ff34e1`) in `headless-header`.

Remaining:

- Delete or clear the `Title` RichText item (`d935bd27-d15d-4da6-9556-34fe838f895b`) in `header-left` — it still holds the inline PLAY! Finance SVG wordmark, which renders next to the Quorum logo.
- Update Navigation labels to: Software, Solutions, Services, Resources, Events, About. These come from the page tree and the Navigation rendering, not from a datasource.

The utility bar (Training, Careers, Contact, Support, Login, search, and the "Request a Demo" CTA) is now the Eyebrow component's `Default` export — `src/components/navigation/Eyebrow.tsx`, styled as `.quorum-eyebrow`. The links and CTA href are hardcoded in that file; edit them there, not in Sitecore.

Because `Default` no longer renders the `eyebrow-left` / `eyebrow-right` placeholders, the Theme Switcher (`d0291f80-d41e-4573-9abd-e186694b5c04`) and Language Switcher (`1f32bf4d-b8e0-45b6-88a5-06755c8ad3e5`) no longer appear, which matches the live site. They are still on the partial design if you want them back — the original placeholder markup is preserved as the `WithPlaceholders` export.

## 4. Footer partial design

Partial: `/sitecore/content/utilities/quorum/Presentation/Partial Designs/Footer` (`9f90c4d9-bf71-40d1-a5ed-880290ba5fb7`)

Already done: footer datasource (`171445fa-968a-4070-aede-ee36354e60c5`) holds the Quorum column copy, logo, and Link1/Link2.

Remaining:

- Update or clear the sibling text items still holding PLAY! Finance details: `Address` (`b17a27b0-3161-49cc-bbd5-ea39646ac986`) and `Contact info` (`dfdb46d5-411e-4606-87c7-187f976eee6c`).
- The Footer template exposes only Link1 and Link2. Decide where these four legal links go — variant markup or an extra rich-text item:
  - Qai Disclaimer — `https://www.quorumsoftware.com/qai-disclaimer/`
  - Cookie Policy — `https://www.quorumsoftware.com/cookie-policy/`
  - Transparency Act — `https://resources.quorumsoftware.com/presentations/transparency-act`
  - Equality & Anti-Discrimintation — `https://resources.quorumsoftware.com/presentations/quality-anti-discrimination`

## 5. Section headings and links with no matching field

These strings are rendered by the variant markup because the templates have no field for them. Edit them in code, not in Pages:

| Section | Text without a field |
|---------|---------------------|
| Customer Success Stories | Section heading; "See All Success Stories" (`https://resources.quorumsoftware.com/case-studies/`); Woodside attribution "Juan Veldsman / Production Allocation and Reporting Implementation Lead" |
| Top Stories in Energy | "Read All Stories" (`https://www.quorumsoftware.com/blog/`) |
| Practical Guide banner | "Access the Guide" CTA is embedded as an `<a>` inside the App Promo Rich Text field, since App Promo has no Link field |

## 6. Remove leftover PLAY! Finance renderings

The Agent API cannot delete components, so these must be removed by hand in Pages. **They are visible and interleaved with the Quorum sections** — the page will not look right until they are gone. This is the one blocking task before the demo is presentable.

| Component | Instance ID |
|-----------|-------------|
| Carousel | `124106de-fb02-4b43-a521-a309fc75a5bc` |
| Promo CTA 1 | `d49a8931-f041-4988-9cc3-f2400e6422d0` |
| Five Column CTA | `b882746c-c313-4283-8f58-b9402bcf9c6a` |
| Three Column CTA | `d54d53b4-1aa4-4998-9bdf-eb934c32cfb6` |
| Promo CTA | `633506e7-54d0-4410-9051-72fb4c9fecb4` |
| Promo CTA | `1a516b9b-cc7b-49c9-a8eb-5be281a98612` |
| Two Column CTA | `0ed2d2c2-e9ef-4e40-b040-6289cb174e03` |
| Article List | `854de8ce-208f-494d-b7c8-c1162d00144f` |
| Documents List | `251b0936-4659-4127-9952-52ca5140d803` |
| App Promo | `7ebe6f29-1c6f-4138-8bf9-287acf0cd530` |
| Article List (empty, added then abandoned — see §7) | `4f892808-5058-4b08-bd08-4459ebeb0c19` |

Also hide the leftover banking child pages (`personal`, `business`, `get-a-loan`) if they show in navigation.

## 7. Top Stories uses Three Column CTA, not Article List

The `Article List` rendering is query-only: it has no datasource template, so `set_component_datasource` returns *"Component does not accept a datasource"* and a newly added instance cannot be given a query root through the API.

The visible Top Stories row therefore uses `ThreeColumnCta` with the `QuorumTopStories` variant, datasource `Quorum - Three Column CTA - Top Stories` (`d57a68f0-59df-46bb-99c6-2f1d59d9ea71`).

The three Quorum article items still exist under `/sitecore/content/utilities/quorum/Home/articles` for deeper navigation. If you want the query-driven Article List instead, set its query root in Pages and order the three Quorum items ahead of the eight PLAY! Finance articles so `NumberOfItems=3` returns the right ones.

## 8. Publish

- Home **version 2** carries the Quorum composition. Confirm it is the active/published version — the preview URL returned by the API defaults to `sc_version=1`, which still shows the starter content.
- `Quorum - Promo CTA - Qnect 26` (`f498bbed-bbd9-4184-a0e2-e83d6a6627a5`) is in **Draft** workflow state. Check the other `/Data/Promos` items and publish the site.

## 9. Known API quirk (for re-runs)

`set_component_datasource` returns `success: true` but silently loses the write when several calls hit the same page in parallel — the layout field is last-write-wins. Components then fall back to the `local:/Data/...` copy that `add_component_on_page` created, which holds the starter's lorem ipsum.

Set datasources **one at a time**, pass the GUID in brace form (`{6B50E8E2-...}`), and re-read with `get_components_on_page` to confirm. All twelve Quorum components were verified wired to `/Data/Promos` items on the final pass.

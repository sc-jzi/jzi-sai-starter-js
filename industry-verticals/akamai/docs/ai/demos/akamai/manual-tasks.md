# Akamai Demo — Manual Tasks

Complete these in Pages / Content Editor. Do **not** hide leftover components with CSS or empty variants.

## 1. Remove leftover components (MCP cannot delete)

Open Home (`/sitecore/content/technology/akamai/Home`) in Pages and **delete**:

| Component | Why |
|-----------|-----|
| Five Column CTA | Not in Akamai build plan |
| Article List | Not in Akamai build plan |
| Documents List | Banking leftover |
| App Promo | Banking leftover |
| Extra Promo CTA (third instance) | Only two Promo CTAs needed (Forrester + AI Infrastructure) |

## 2. Variant selection checklist

Open Home in Pages → select each component → Design tab → set variant:

| # | Component | Needed variant | Variant item path |
|---|-----------|----------------|-------------------|
| 1 | Header (partial) | Akamai | `/…/Headless Variants/Header/Akamai` |
| 2 | Hero | Akamai | `/…/Headless Variants/Hero/Akamai` `{A046211C-5B10-4134-AD13-FB0FB7E58190}` |
| 3 | Two Column CTA | AkamaiProductTiles | `/…/Two Column CTA/AkamaiProductTiles` `{9A3B1FF8-4A6C-4CC7-B7FE-ABEBC3450663}` |
| 4 | Promo CTA (Forrester) | Akamai | `/…/Promo CTA/Akamai` `{2C5DFBDC-5987-4F7C-8DEF-40F6A27EE011}` |
| 5 | Promo CTA (AI Infrastructure) | AkamaiImageLeft | `/…/Promo CTA/AkamaiImageLeft` `{D7F9AC0A-A918-4A0A-90D1-DB203F305466}` |
| 6 | Heading CTA (What's new) | AkamaiSectionTitle | `{FFE934BE-C234-4CA0-BE9E-3C3EC5CE0B8A}` |
| 7 | Four Column CTA | AkamaiWhatsNew | `{ABE923F4-6221-4D35-9C3B-C51C65E99068}` |
| 8 | CTA Banner | AkamaiBrand | `{88FE9007-AA6B-42C7-A628-D135D2F44BF7}` |
| 9 | Heading CTA (Capabilities) | AkamaiSectionTitle | `{FFE934BE-C234-4CA0-BE9E-3C3EC5CE0B8A}` |
| 10 | Three Column CTA | Akamai | `{E172F7B2-8C38-44D7-827A-9F58FE469486}` |
| 11 | Heading CTA (Contact) | AkamaiContact | `{D258C1A3-6DD4-453C-AA8E-781F0C4CDDCC}` |
| 12 | Footer (partial) | Akamai | `/…/Headless Variants/Footer/Akamai` `{C552BFB1-3586-458E-934F-2E29E6269708}` |

Estimated time: ~3–4 minutes.

## 3. Context-only / partial designs

| Component | Action |
|-----------|--------|
| Header | In Header partial design: select **Akamai** variant; update logo/nav if needed |
| Footer | Assign `Akamai - Footer` (or update existing Footer DS) and select **Akamai** variant |

## 4. Images to upload

Akamai Edge blocked automated image download. Upload these to Content Hub, create public links, then set Image fields:

| Target | Field | Suggested asset |
|--------|-------|-----------------|
| Hero | Image | Navy/cyan wave hero art (replace banking photo if needed) |
| Promo Forrester | Image | Forrester logo / report graphic |
| Promo AI Infrastructure | Image | “What breaks next in your AI stack?” graphic |
| Four Column cards | Image1–4 | Gartner / SOTI / case study / white paper thumbnails |
| CTA Banner | Image | Large Akamai wave/globe mark |
| Three Column | Image1–3 | Cloud / Security / Delivery photography |

## 5. Reorder (optional)

Ideal order: Hero → Two Column tiles → Forrester Promo → AI Promo → What's new title → Four Column → Brand banner → Capabilities title → Three Column → Contact. Drag in Pages if order differs.

## 6. Personalization (optional)

Create segment-specific datasources as `Akamai - <Component> - <Segment>` under the same Data folders, then Personalize in Pages.

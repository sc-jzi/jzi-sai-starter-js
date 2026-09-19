# API Security Page — Manual Tasks

Page: `/sitecore/content/technology/akamai/Home/products/cybersecurity/api-security`  
Route: `/products/cybersecurity/api-security`

Open the page in **Pages** and select variants / finish FAQ as below. Shared datasources live under `/sitecore/content/technology/akamai/Data/...`.

## 1. Variant selection checklist

| # | Section | Component | Select variant | Variant path / ID |
|---|---------|-----------|----------------|-------------------|
| 1 | Hero | Hero | **AkamaiProduct** | `…/Hero/AkamaiProduct` `{04C2A841-702C-4B07-A308-6FFC2B3167D7}` |
| 2 | Comprehensive | Promo CTA | **Akamai** (usually already set) | `{2C5DFBDC-5987-4F7C-8DEF-40F6A27EE011}` |
| 3 | Value props | Three Column CTA | **AkamaiValueProps** | `{EE4B66BC-A021-49BD-8FED-905FF5AACA28}` |
| 4 | Discovery | Promo CTA | **AkamaiImageLeft** | `{D7F9AC0A-A918-4A0A-90D1-DB203F305466}` |
| 5 | Icon bar | Four Column CTA | **AkamaiIconBar** (often already set) | `{F43AB253-933C-415D-8D03-34C9B2538431}` |
| 6 | Split ebook | Two Column CTA | **AkamaiSplitPromo** | `{4E72C335-2F06-4FF2-8A27-D1D8654748B6}` |
| 7 | Webinar | Heading CTA | **AkamaiContact** | `{D258C1A3-6DD4-453C-AA8E-781F0C4CDDCC}` |
| 8–9 | Feature cards | Three Column CTA (×2) | **AkamaiFeatureCards** | `{9C2533FE-F8A0-49DF-8F72-9B91B0BD66D3}` |
| 10 | Assessment | Heading CTA | **AkamaiContact** | `{D258C1A3-…}` |
| 11 | Trusted title | Heading CTA | **AkamaiSectionTitle** | `{FFE934BE-C234-4CA0-BE9E-3C3EC5CE0B8A}` |
| 12 | Customer stories | Three Column CTA | **AkamaiStories** | `{D0266E14-E185-4F0C-AACF-52CD54212081}` |
| 13 | What's New | Promo CTA | **Akamai** | `{2C5DFBDC-…}` |
| 14 | FAQ title | Heading CTA | **AkamaiSectionTitle** | `{FFE934BE-…}` |
| 15 | FAQ | Questions | **Akamai** | `{0D216947-06AD-4585-9C0A-18D149D390FA}` |
| 16 | Expert | Heading CTA | **AkamaiContact** | `{D258C1A3-…}` |
| 17 | Related title | Heading CTA | **AkamaiSectionTitle** | `{FFE934BE-…}` |
| 18 | Related cards | Three Column CTA | **Akamai** | `{E172F7B2-8C38-44D7-827A-9F58FE469486}` |
| 19 | Contact | Contact Form | **AkamaiLead** (often already set) | `{FA8DB923-B0B2-4522-B22A-118D3ABF6819}` |

## 2. Add Questions (FAQ) manually

API add fails (missing branch template). In Pages:

1. Add **Questions** to `headless-main` (after FAQ title).
2. Set datasource to `/sitecore/content/technology/akamai/Data/Questions/API Security FAQ`.
3. Set variant **Akamai**.

## 3. Optional order cleanup

Ideal order: Hero → Comprehensive → Value props → Discovery → Icon bar → Split promo → Webinar → Features 1 → Features 2 → Assessment → Trusted → Stories → What's New → FAQ title → Questions → Expert → Related title → Related → Contact.

Drag in Pages if placeholders landed out of order.

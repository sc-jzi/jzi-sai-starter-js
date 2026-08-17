# PSEG Demo — Manual Assembly Tasks

Page assembly APIs (`set_component_datasource`, `add_component_on_page`) returned HTTP 500. Complete these steps in **Pages** or **Content Editor** for `/sitecore/content/utilities/pseg/Home`.

## Page setup

1. Set the Home page **Title** to `PSEG` (API update returned 500)
2. Remove or hide PLAY! starter sections not used on this demo:
   - Comparison (×2, nested in the Two Column CTA placeholders)
   - Five Column CTA
   - Article List
   - Documents List
   - App Promo

## Recommended component order (top → bottom)

| # | Component | Variant | Datasource |
|---|-----------|---------|------------|
| 1 | Carousel | Pseg | `/sitecore/content/utilities/pseg/Home/Data/PSEG - Hero Carousel` `{52E39800-93CC-444A-95B9-4E9ED73284A4}` |
| 2 | Four Column CTA | PsegQuickLinks | `PSEG - Quick Links` `{5AE97E0B-ED18-4FC2-A649-ED70BCCEB3E1}` |
| 3 | Two Column CTA | PsegAccountCards | `PSEG - Account Cards` `{77A67951-0B08-489E-B9FC-29E8A5A43D60}` |
| 4 | Promo CTA | PsegBusiness | `PSEG - Business Needs` `{012620DB-7D2E-4526-A5B7-CC37FCA67C81}` |
| 5 | Heading CTA **(add)** | Pseg | `PSEG - WorryFree Intro` `{6B4E53A9-2B3D-4DC7-8EC4-24846213D061}` |
| 6 | Three Column CTA | PsegWorryFree | `PSEG - WorryFree Services` `{F4BADAA8-DCCB-4DDD-945F-7686E72C7B4B}` |
| 7 | CTA Banner **(add)** | PsegAppointment | `PSEG - Make an Appointment` `{9B11927B-AF95-4D65-81EE-FD08A7A671D4}` |
| 8 | Promo CTA | PsegSavings | `PSEG - Energy Savings` `{40FB1F16-D560-4306-A1F4-AC1A4FF968F5}` |
| 9 | Promo CTA | PsegCommunity | `PSEG - Powering the Future` `{9063F9DC-5D8F-4510-B9E3-E90ACE44DBBC}` |
| 10 | Promo CTA **(add)** | PsegStorm | `PSEG - Storm Preparation` `{64E6AA55-969C-4C00-BCED-C62843FDD666}` |

Existing Home instances to rewire (do not add duplicates):

| Component | Instance ID | Placeholder |
|-----------|-------------|-------------|
| Carousel | `{124106DE-FB02-4B43-A521-A309FC75A5BC}` | `headless-main` |
| Four Column CTA | `{09CFD835-87F6-4D58-9681-9C6EA1A3228B}` | `/headless-main/row-1-7` (move to `headless-main` if it sits inside a leftover container) |
| Two Column CTA | `{0ED2D2C2-E9EF-4E40-B040-6289CB174E03}` | `headless-main` |
| Promo CTA | `{D49A8931-F041-4988-9CC3-F2400E6422D0}` | `headless-main` → Business |
| Three Column CTA | `{D54D53B4-1AA4-4998-9BDF-EB934C32CFB6}` | `headless-main` |
| Promo CTA | `{633506E7-54D0-4410-9051-72FB4C9FECB4}` | `headless-main` → Savings |
| Promo CTA | `{1A516B9B-CC7B-49C9-A8EB-5BE281A98612}` | `headless-main` → Community |

## Partial designs

- **Header** partial: set variant to **Pseg**. Nav labels can stay Sitecore-driven (`header-right`). Logo falls back to `/pseg/logo.png` until LogoImage is set.
- **Footer** partial: set variant to **Pseg**. Update column titles, links, and copyright to PSE&G.

## Variant GUIDs (FieldNames parameter)

| Component | Variant | Item ID |
|-----------|---------|---------|
| Header | Pseg | `{7A1F57ED-B56D-45D8-BBC5-30E9F0166EEF}` |
| Carousel | Pseg | `{B72541DA-25AF-410D-880E-03A7551DED31}` |
| FourColumnCta | PsegQuickLinks | `{932C2321-AC0F-4357-946C-4C57D5B2605A}` |
| TwoColumnCta | PsegAccountCards | `{25BD5CFA-5F25-46EA-854F-DF69A0E9683B}` |
| PromoCta | PsegBusiness | `{B6231F5A-F6F3-4CC3-9645-195B7EC0CBA7}` |
| HeadingCta | Pseg | `{817EE3A8-E283-4F00-B468-1A11E1AF69C9}` |
| ThreeColumnCta | PsegWorryFree | `{33203A36-FC23-4A16-AA56-94A5E6B93AF7}` |
| CtaBanner | PsegAppointment | `{4577BD65-7FED-4BD8-9D31-70A5016EF01A}` |
| PromoCta | PsegSavings | `{5A7B05F6-7DB4-4E98-BC77-C88B91BA5A1C}` |
| PromoCta | PsegCommunity | `{2F10168A-E9F1-47BD-9696-8995B0E39EA5}` |
| PromoCta | PsegStorm | `{CD380FBB-17B8-4996-BFC3-C3FC4F4D3987}` |
| Footer | Pseg | `{BAF6798F-1B15-486A-94AB-A3D812609281}` |

See `variant-checklist.md` for Pages editor steps.

## Images

Content Hub is down (HTTP 503). Variants fall back to `public/pseg/*`. When DAM is available, follow `images-to-upload.md`.

## Login card

The hero **Login / Register** card is visual chrome only. It links to `https://nj.myaccount.pseg.com/user/login` and `/user/register`. There is no Sitecore auth in this demo.

## Personalization (optional)

Create extra datasources in Home/Data using `<PSEG> - <Component> - <Segment>`, then Personalize in Pages.

## Dev server

Restart the PSEG rendering host so new variants and `site-pseg` styles load:

```bash
cd industry-verticals/pseg
npm run dev
```

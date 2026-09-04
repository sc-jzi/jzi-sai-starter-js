# Chamberlain University — Manual Tasks

## Pages editor

1. **Assign remaining variants** on Home (`/sitecore/content/covista/Chamberlain/Home`). `FieldNames` sometimes landed on the wrong Chamberlain variant (for example Insights received `ChamberlainCare`). Set:
   - Hero → `Chamberlain`
   - Start dates Three Column CTA → `ChamberlainStartDates`
   - Largest school Heading CTA → `Chamberlain`
   - ProgramCarousel → `Chamberlain`
   - Accreditation Five Column CTA → `ChamberlainLogos`
   - Google Cloud Promo CTA → `Chamberlain`
   - Scholarships Heading CTA → `ChamberlainBanner`
   - Videos Three Column CTA → `ChamberlainVideos`
   - Care cards Three Column CTA → `ChamberlainCare`
   - Stats Counter → `Chamberlain`
   - Partner search Heading CTA → `ChamberlainSearch`
   - Completion Grant Promo CTA → `ChamberlainGrant`
   - DAISY Promo CTA → `ChamberlainDaisy`
   - Insights Three Column CTA → `ChamberlainInsights`
2. **Add the FAQ Accordion** manually. `add_component_on_page` failed because `/sitecore/templates/Branches/Project/Verticals/Accordion` is missing. Datasource already exists: `/sitecore/content/covista/Chamberlain/Data/Chamberlain - FAQ` (`{05189E94-9BAC-439C-9417-220F67140CBD}`). Variant: `Chamberlain`.
3. **Remove leftover PLAY! Financial components** still on `headless-main` (Carousel, Comparison, Documents List, App Promo, old Promo CTAs, Article List, Two Column CTA) so the homepage is Chamberlain-only.
4. **Header / Footer partials** — set the white Chamberlain wordmark on Header (`Chamberlain` variant) and restyle Footer (`Chamberlain` variant). These are not API-addable.

## Images and video

The content extractor returned 0 downloadable images. Upload client photography in Content Hub, then set Image fields on the Chamberlain datasources. See `images-to-upload.md`.

Section 10 care cards support **image or video**. Optional File fields `Video1` / `Video2` / `Video3` are on the shared Three Column CTA template. If a video is present, the ChamberlainCare variant plays it; otherwise it shows `ImageN`.

## Program carousel datasource

ProgramCarousel is wired to `/sitecore/content/covista/Chamberlain/Home/personal` (`{F16F03EA-196C-45BC-84CC-C876920F6C60}`). It reads **Content Page** children. Existing leftover Financial pages were retitled to BSN / MSN / DNP and an MPAS child was added, plus campus/program link grandchildren. Replace those pages with real program pages when ready — the component handles 0–n cards.

## Rendering host

Restart `npm run dev` in `industry-verticals/chamberlain` so `.sitecore/component-map.ts` picks up `ProgramCarousel`.

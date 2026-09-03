# Walden University — Manual Tasks

## 1. Assemble Home (required)

The XM Cloud layout API returned **500** for `/sitecore/content/covista/walden/Home`, so components could not be added from the agent. Datasources, images, and Walden variants are ready.

In **Pages**, open Home (`619a2190-6c73-4ca0-9bd2-0cea20e6486d`) and add these to `headless-main` **in this order**:

1. Hero → `Walden University - Hero` → variant **Walden**
2. Four Column CTA → `Walden University - Program Finder` → **WaldenProgramFinder**
3. Features → `Walden University - Foundation for Impact` → **Walden**
4. Promo CTA → `Walden University - AI Certificates` → **Walden**
5. Promo CTA → `Walden University - Education Options` → **WaldenEducation**
6. Heading CTA → `Walden University - Graduation Path` → **Walden**
7. Promo CTA → `Walden University - Quality Matters` → **WaldenQuality**
8. Four Column CTA → `Walden University - Areas of Interest` → **WaldenInterestGrid**
9. Quote → `Walden University - Alumni Quote` → **Walden**
10. Promo CTA → `Walden University - Goals Within Reach` → **WaldenGoals**
11. CTA Banner → `Walden University - B Corp` → **WaldenTrust**
12. Promo CTA → `Walden University - Whats Next` → **WaldenLinkCard**
13. Accordion → `Walden University - FAQ` → **Walden**

IDs: see `variant-checklist.md`.

Remove leftover PLAY! Financial components (loan promo, product tiles, etc.).

## 2. Variant selection (partials)

On the header/footer partial designs:

- Eyebrow → **Walden**
- Header → **Walden** (logo left; assign Walden logo to `LogoImage`)
- Footer → **Walden**

## 3. Hero photograph

The live hero is a lazy/background image and was not extracted. Upload a smiling professional-woman photo to Content Hub and set **Image** on `Walden University - Hero`.

## 4. Header / footer content

- Replace PLAY! logo with Walden wordmark (`docs/ai/themes/walden-university/images/logo.svg`)
- Update nav to PROGRAMS / FINANCING / ADMISSIONS / WHY WALDEN
- Utility bar: Login, Alumni, Contact, 855-323-7977, APPLY NOW
- Footer: four Walden link columns, socials, copyright, accreditation logos

## 5. Link check

External links currently point at waldenu.edu. Confirm they are acceptable for the demo or retarget to in-site pages.

## 6. Deploy frontend

Walden variants live in `industry-verticals/walden`. Deploy or run `npm run dev` so Pages can resolve the new named exports.

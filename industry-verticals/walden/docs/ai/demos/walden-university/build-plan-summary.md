# Walden University — Build Plan

> **Source:** https://www.waldenu.edu/
> **Analyzed:** 2026-09-03
> **Sections:** 16 (16 template, 0 custom components)
> **Implementation library:** PLAY! Financial components already on `/sitecore/content/covista/walden`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Dark teal strip with Login, Alumni, Contact, phone, and Apply Now_ | Eyebrow | Default | Medium | Header partial — manual |
| 2 | _White bar with Walden logo, all-caps nav, search, gold Request Information_ | Header | WithLogoImage | High | Header partial — manual |
| 3 | _Full-bleed photo of a smiling professional, white serif headline “Your Career Is Our Job,” two dropdowns, gold Get Started_ | Hero | Default → Walden | High | Dropdowns need a custom variant |
| 4 | _Dark teal bar overlapping the hero: program search plus Bachelor's / Master's / Doctoral / Certificate_ | Four Column CTA | Default → WaldenProgramFinder | Medium | Search field is extra |
| 5 | _“A Foundation for Impact” copy on the left, three icon highlights on the right_ | Features | Default → Walden | Medium | Features only has 2 item slots |
| 6 | _Split banner: woman-and-child photo with Walden + Google Cloud logos, AI certificates offer, gold CTA_ | Promo CTA | Default → Walden | High | |
| 7 | _“Education Options to Fit Your Needs” with a lifestyle photo and Tempo Learning copy_ | Promo CTA | Default → WaldenEducation | High | Path pills need a variant |
| 8 | _Solid navy conversion bar with a gold Request Information button_ | Heading CTA | Compact → Walden | High | |
| 9 | _“Quality Matters” text beside a ranking/accreditation card with carousel dots_ | Promo CTA | WithPlaceholderColumn | Medium | Carousel becomes a single card |
| 10 | _Four-column “Browse by Your Area of Interest” lists (Nursing, Health, Psychology, Education)_ | Four Column CTA | Default → WaldenInterestGrid | Medium | Live cards are link lists, not photos |
| 11 | _Alumna photo beside a large flexibility quote_ | Quote | Default → Walden | High | |
| 12 | _“Your Goals Within Reach” copy beside two people at a computer_ | Promo CTA | Default → WaldenGoals | High | |
| 13 | _Dark teal trust bar with a seal and “50 years / B Corp” statement_ | CTA Banner | Default → WaldenTrust | Medium | Hide the large image |
| 14 | _Man at a laptop with a floating white card of gold-arrow links_ | Promo CTA | Default → WaldenLinkCard | Medium | Overlapping card is custom layout |
| 15 | _Dark navy “FAQ about Walden's Online Programs” accordion_ | Accordion | Default → Walden | High | Heading is not a parent field |
| 16 | _Dark teal mega footer: logo, gold CTA, link columns, socials, accreditation logos_ | Footer | WithSocials → Walden | High | Footer partial — manual |

---

## Sections that need attention

> [!WARNING]
> These sections match a template but need a Walden variant (or will lose a visual detail) if we stay on generic layouts.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Hero with degree + field dropdowns_ | Hero only has Title / Text / Image / Link | Walden variant adds the two dropdowns + gold Get Started |
| 4 | _Program search + four degree buttons_ | Four Column CTA has no search input | WaldenProgramFinder variant, or accept four buttons only |
| 5 | _Three icon highlights_ | Features has two item fields | Walden variant with a third item, or drop the third |
| 10 | _Interest-area link lists_ | Four Column CTA expects images | WaldenInterestGrid: gold-arrow links, no photos |
| 14 | _Floating link card on a photo_ | No overlapping-card layout | WaldenLinkCard variant |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 2 | Header | WithLogoImage | Live header shows the Walden wordmark on the left |
| 3 | Hero | Default (then Walden) | Full-bleed photo overlay — Financial HeroBanner is a split layout |
| 8 | Heading CTA | Compact | Horizontal conversion strip, not a large image banner |
| 9 | Promo CTA | WithPlaceholderColumn | Text + card column instead of a full photo split |
| 16 | Footer | WithSocials | Live footer includes Facebook, X, LinkedIn, YouTube |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Hero | Simple (1 item) |
| 4 | Four Column CTA (program finder) | Simple (1 item) |
| 5 | Features | Simple (1 item) |
| 6 | Promo CTA (AI certificates) | Simple (1 item) |
| 7 | Promo CTA (education options) | Simple (1 item) |
| 8 | Heading CTA | Simple (1 item) |
| 9 | Promo CTA (quality matters) | Simple (1 item) |
| 10 | Four Column CTA (areas of interest) | Simple (1 item) |
| 11 | Quote | Simple (1 item) |
| 12 | Promo CTA (goals) | Simple (1 item) |
| 13 | CTA Banner | Simple (1 item) |
| 14 | Promo CTA (next steps) | Simple (1 item) |
| 15 | Accordion | List (parent + FAQ children) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Eyebrow | Header partial design | Restyle the existing utility bar; do not add via API |
| 2 | Header | Header partial design | Set Walden logo; keep nav placeholders |
| 16 | Footer | Footer partial design | Assign Walden footer datasource / restyle existing footer |

### Custom components needed

None — all sections matched existing Financial components. Pixel-perfect Walden layouts are **variants**, not new renderings.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. Hero
  2. FourColumnCta (program finder)
  3. Features
  4. PromoCta (AI certificates)
  5. PromoCta (education options)
  6. HeadingCta
  7. PromoCta (quality matters)
  8. FourColumnCta (areas of interest)
  9. Quote
  10. PromoCta (goals)
  11. CtaBanner
  12. PromoCta (next steps)
  13. Accordion (+ FAQ children)

Phase 2 — Apply theme (navy/gold CSS variables + Noto Serif / Mulish)

Phase 3 — Custom components: none
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the Walden homepage screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) for each section, or are the generic Financial layouts sufficient once the Walden theme is applied?

> Reply "approved" to proceed, or describe any changes needed.

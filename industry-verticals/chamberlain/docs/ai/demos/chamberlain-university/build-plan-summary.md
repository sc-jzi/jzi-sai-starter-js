# Chamberlain University — Build Plan

> **Source:** https://www.chamberlain.edu/
> **Analyzed:** 2026-09-04
> **Sections:** 17 (16 template, 1 custom component)
> **Implementation library:** PLAY! Financial components already on `/sitecore/content/covista/Chamberlain`

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _White Chamberlain wordmark and nav over the hero photo, gold Request Information and navy Apply_ | Header | WithLogoImage → Chamberlain | High | Header partial — manual |
| 2 | _Full-bleed photo of celebrating clinicians, “PREPARING NURSES to Meet the Moment,” RN dropdown, gold Get Started_ | Hero | Default → Chamberlain | High | Dropdown needs a custom variant |
| 3 | _Navy bar on the hero with Next Start Date, upcoming dates, and MPAS campuses_ | Three Column CTA | Default → ChamberlainStartDates | High | Text-only date columns |
| 4 | _“#1 Largest School of Nursing in the US” intro copy_ | Heading CTA | Default → Chamberlain | High | Sits above the program cards |
| 5 | _Program cards carousel (0–n), navy icons, arrow links, progress + prev/next_ | **ProgramCarousel (new)** | Default → Chamberlain | High | Datasource: Home/personal Content Page children |
| 6 | _“Proudly Accredited” row of HLC, CCNE, NLN CNEA, and CSWE seals_ | Five Column CTA | Default → ChamberlainLogos | Medium | Fifth slot unused |
| 7 | _Google Cloud AI certificates split banner with a gold Explore CTA_ | Promo CTA | Default → Chamberlain | High | |
| 8 | _Navy bar: $87M in scholarships and grants, gold Request Information_ | Heading CTA | Compact → ChamberlainBanner | High | |
| 9 | _Navy “Built To Lift Up Those Who Care” with three portrait video cards_ | Three Column CTA | Default → ChamberlainVideos | Medium | Videos use poster images |
| 10 | _Three white cards: Chamberlain Care, largest nursing school, 25+ campuses_ | Three Column CTA | WithIcons → ChamberlainCare | High | Each card supports image **or** video |
| 11 | _Big numbers: 12,000+ partner locations, 90% aid, $87M grants_ | Stats Counter | Default → Chamberlain | High | |
| 12 | _Navy “See If You Qualify for Partner Tuition Rates” search strip_ | Heading CTA | Compact → ChamberlainSearch | Medium | Search field is extra |
| 13 | _Commitment to Completion Grant — save up to $11,000_ | Promo CTA | Default → ChamberlainGrant | High | |
| 14 | _Uplifting Our Nurses / DAISY — nurse-and-child photo, Learn More_ | Promo CTA | Default → ChamberlainDaisy | High | |
| 15 | _Insights to Inspire — one featured story plus two smaller tiles_ | Three Column CTA | Default → ChamberlainInsights | Medium | Live layout is asymmetric |
| 16 | _“Answers at every level” expandable FAQ_ | Accordion | Default → Chamberlain | High | Heading is not a parent field |
| 17 | _Navy mega footer with logo, CTAs, link columns, and socials_ | Footer | WithSocials → Chamberlain | High | Footer partial — manual |

---

## Sections that need attention

> [!WARNING]
> These sections match a template but need a Chamberlain variant (or will lose a visual detail) if we stay on generic layouts.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 2 | _Hero with RN dropdown_ | Hero only has Title / Text / Image / Link | Chamberlain variant adds the dropdown + gold Get Started |
| 5 | _Program card carousel_ | Needs a new component — Four Column CTA cannot do 0–n cards from page children | ProgramCarousel querying Content Page children of Home/personal |
| 9 | _Portrait video cards_ | Testimonials is a quote/star carousel | Three Column CTA + poster images |
| 12 | _Partner search field_ | Heading CTA has a button, not an input | ChamberlainSearch variant, or a Search Partners button |
| 15 | _Featured + two stacked articles_ | Three Column CTA is a symmetric 3-up | ChamberlainInsights can enlarge the first card |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | WithLogoImage | Live header shows the Chamberlain wordmark |
| 8 | Heading CTA | Compact | Horizontal conversion strip, not a large image banner |
| 10 | Three Column CTA | WithIcons | Icon + title + body support cards |
| 12 | Heading CTA | Compact | Horizontal navy finder/search strip |
| 17 | Footer | WithSocials | Live footer includes Facebook, X, LinkedIn, YouTube, Instagram |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero | Simple (1 item) |
| 3 | Three Column CTA (start dates) | Simple (1 item) |
| 4 | Heading CTA (#1 school) | Simple (1 item) |
| 5 | ProgramCarousel (programs) | Existing page: `/Home/personal` |
| 6 | Five Column CTA (accreditation) | Simple (1 item) |
| 7 | Promo CTA (Google Cloud) | Simple (1 item) |
| 8 | Heading CTA (scholarships) | Simple (1 item) |
| 9 | Three Column CTA (videos) | Simple (1 item) |
| 10 | Three Column CTA (care cards) | Simple (1 item) |
| 11 | Stats Counter | Simple (1 item) |
| 12 | Heading CTA (partner search) | Simple (1 item) |
| 13 | Promo CTA (completion grant) | Simple (1 item) |
| 14 | Promo CTA (DAISY) | Simple (1 item) |
| 15 | Three Column CTA (insights) | Simple (1 item) |
| 16 | Accordion | List (parent + FAQ children) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Set Chamberlain logo; keep nav placeholders |
| 17 | Footer | Footer partial design | Assign Chamberlain footer datasource / restyle existing footer |

### Custom components needed

| # | Component | Why |
|---|-----------|-----|
| 5 | ProgramCarousel | Horizontal slider of 0–n program cards from Content Page children. Datasource is `/sitecore/content/covista/Chamberlain/Home/personal`. |

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. Hero
  2. ThreeColumnCta (start dates)
  3. HeadingCta (#1 school)
  4. ProgramCarousel (wire to Home/personal — no new Data-folder item)
  5. FiveColumnCta (accreditation)
  6. PromoCta (Google Cloud)
  7. HeadingCta (scholarships)
  8. ThreeColumnCta (videos)
  9. ThreeColumnCta (care cards)
  10. StatsCounter
  11. HeadingCta (partner search)
  12. PromoCta (completion grant)
  13. PromoCta (DAISY)
  14. ThreeColumnCta (insights)
  15. Accordion (+ FAQ children)

Phase 2 — Apply theme (navy/gold CSS variables + Barlow Condensed / EB Garamond / Source Sans 3)

Phase 3 — Custom components:
  1. ProgramCarousel rendering + ComponentQuery + React slider
  2. Optional Video1/2/3 fields on Three Column CTA
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the Chamberlain homepage screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) for each section, or are the generic Financial layouts sufficient once the Chamberlain theme is applied?

> Reply "approved" to proceed, or describe any changes needed.

# Suffolk County — Build Plan

> **Source:** https://suffolkcountyny.gov/  
> **Analyzed:** 2026-08-18  
> **Sections:** 9 (9 starter-kit matches, 0 net-new custom components)  
> **Environment:** `/sitecore/content/public-sector/suffolk-county`  
> **Note:** UIIM `fmc-custom-demo` is not deployed — using starter kit components (same approach as Huron).

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Thin alert strip: "Cooling Facilities in Suffolk County" with Cooling Centers link_ | Heading CTA | Default → SuffolkAlert | High | Custom variant for compact red/navy bar |
| 2 | _Seal + "Suffolk County Government" / County Executive, social, language, blue nav_ | Header | Default → Suffolk | High | Partial design — manual |
| 3 | _Lighthouse photo, "What are you looking for?", Search Suffolk County field_ | Hero | Default → Suffolk | High | Search chrome in custom variant |
| 4 | _Blue band "What would you like to do?" + 2×3 icon cells (311, Pay, Register/Apply, Find Work, Land Search, Contact)_ | Heading CTA + Two × Three Column CTA | SuffolkQuickActions | High | Six actions = two rows of three |
| 5 | _Full-width photo banner (Emergency Preparedness on live site)_ | CTA Banner | Default → Suffolk | High | Original screenshot had Stop Bullying |
| 6 | _Four-column department directory with blue headings and nested links_ | Four Column CTA | Default → SuffolkDirectory | Medium | Needs text-list variant, not image cards |
| 7 | _County News list + County Events calendar side by side_ | Two Column CTA | Default → SuffolkNewsEvents | Medium | Default is promo cards, not lists |
| 8 | _"Front Page Featured Services" — five image cards with Visit_ | Heading CTA + Five Column CTA | Suffolk | High | Strong field match |
| 9 | _Navy footer with lighthouse watermark, two addresses, Services & Elected Officials_ | Footer | Default → Suffolk | High | Partial design — manual |

---

## Sections that need attention

> [!WARNING]
> Review these before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Hero search box_ | Starter Hero is title + body + button, not a search field | Custom Suffolk variant can look like search; live search wiring optional |
| 5 | _Promo banner_ | Live site shows Emergency Preparedness; your screenshot showed Stop Bullying | Using live copy; say if you want Stop Bullying instead |
| 6 | _Directory_ | Four Column CTA is image cards; live site is dense text links | SuffolkDirectory variant: headings + link lists |
| 7 | _News + events_ | Two Column CTA is two promos, not a news list / calendar | SuffolkNewsEvents variant, or Article List later |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Heading CTA | SuffolkAlert | Civic alert strip, not a marketing H2 |
| 2 | Header | Suffolk | Seal + navy brand bar + blue icon nav |
| 3 | Hero | Suffolk | Full-bleed lighthouse + centered search |
| 4 | Three Column CTA | SuffolkQuickActions | Bordered icon cells, 3-up |
| 5 | CTA Banner | Suffolk | Photo banner with overlay card |
| 6 | Four Column CTA | SuffolkDirectory | Text directory, no card images |
| 7 | Two Column CTA | SuffolkNewsEvents | News rows + event date boxes |
| 8 | Five Column CTA | Suffolk | Image + title + Visit button |
| 9 | Footer | Suffolk | Navy + lighthouse + two address columns |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 1 | Heading CTA | Suffolk County - Alert Bar |
| 3 | Hero | Suffolk County - Hero |
| 4a | Heading CTA | Suffolk County - Quick Actions Intro |
| 4b | Three Column CTA | Suffolk County - Quick Actions Row 1 |
| 4c | Three Column CTA | Suffolk County - Quick Actions Row 2 |
| 5 | CTA Banner | Suffolk County - Promo Banner |
| 6 | Four Column CTA | Suffolk County - Service Directory |
| 7 | Two Column CTA | Suffolk County - News and Events |
| 8a | Heading CTA | Suffolk County - Featured Intro |
| 8b | Five Column CTA | Suffolk County - Featured Services |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 2 | Header | Header partial design | Swap logo to county seal; set nav labels |
| 9 | Footer | Footer partial design | Addresses, Services, Elected Officials |

### Custom components needed

None — all sections matched starter kit components. Pixel-perfect layout (if requested) is Phase 5.5 variants, not new components.

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. HeadingCta — Suffolk County - Alert Bar
  2. Hero — Suffolk County - Hero
  3. HeadingCta — Suffolk County - Quick Actions Intro
  4. ThreeColumnCta — Suffolk County - Quick Actions Row 1
  5. ThreeColumnCta — Suffolk County - Quick Actions Row 2
  6. CtaBanner — Suffolk County - Promo Banner
  7. FourColumnCta — Suffolk County - Service Directory
  8. TwoColumnCta — Suffolk County - News and Events
  9. HeadingCta — Suffolk County - Featured Intro
  10. FiveColumnCta — Suffolk County - Featured Services

Phase 2 — Apply theme (navy/blue/red, Heebo + Arimo)

Phase 3 — Custom variants (if approved)

Phase 4 — Assemble Home page + wire datasources
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic starter variants sufficient?

> Reply **approved** to proceed, or describe any changes needed.

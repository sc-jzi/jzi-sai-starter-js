# PSEG — Build Plan

> **Source:** https://nj.pseg.com/  
> **Analyzed:** 2026-08-17  
> **Sections:** 12 (11 template, 1 custom approximate)  
> **Environment:** `/sitecore/content/Utilities/pseg`  
> **Code:** `industry-verticals/pseg`  
> **Note:** UIIM `fmc-custom-demo` library is not deployed — using Financial starter kit components (same approach as Quanex / Huron).

---

## Theme (Phase 1)

| Token | Value | Role |
|-------|-------|------|
| Primary navy | `#002F6C` | Utility bar, LOGIN button, energy banner, headings |
| Accent orange | `#F37022` | Logo sunburst, brand accent |
| Footer navy | `#001F3D` | Mega footer |
| Background | `#FFFFFF` | Page / cards |
| Muted | `#F4F6F8` | Appointment band, card chrome |
| Font | Source Sans 3 | Already loaded by `site-financial` |
| Radius | 4px | Buttons and cards — nearly square |
| Hero | Navy gradient + award graphic | Not a full-bleed photo |
| Nav | Solid white bar under navy utility strip | |

Playwright was not installed in this app, so hex values come from the screenshot plus official PSEG orange (`#F37022`). Navy is matched to the live homepage UI, not the logo’s raisin black.

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Navy utility bar + orange PSEG logo, icon shortcuts, and main nav_ | Header | Default → Pseg | High | Partial design — manual |
| 2 | _Navy gradient carousel with J.D. Power trophy, award headline, and Login to My Account card_ | Carousel | Default → Pseg | High | Login card is visual only |
| 3 | _Four quick-link tiles under the hero_ | Four Column CTA | PsegQuickLinks | High | Compact bordered tiles |
| 4 | _MyAlerts and MyMeter photo cards with two buttons each_ | Two Column CTA | PsegAccountCards | High | Dual CTAs need custom variant |
| 5 | _Photo banner — "We Understand Your Needs" + Explore Business Resources_ | Promo CTA | WithBackgroundImage → PsegBusiness | High | |
| 6 | _Centered "WorryFree® Appliance Service" intro_ | Heading CTA | Centered → Pseg | High | |
| 7 | _Repair / Protect / Replace photo columns_ | Three Column CTA | PsegWorryFree | High | |
| 8 | _"Make an Appointment" + CSR headset photo_ | CTA Banner | PsegAppointment | High | Not on Home today — add |
| 9 | _Navy "Little Changes Mean Big Savings" with category links_ | Promo CTA | PsegSavings | Medium | Link list needs custom variant |
| 10 | _Community photo + "PSE&G is Powering the Future"_ | Promo CTA | PsegCommunity | High | |
| 11 | _"Storm Preparation" + emergency-kit photo_ | Promo CTA | PsegStorm | High | |
| 12 | _Deep navy mega footer with links, social, search_ | Footer | Default → Pseg | High | Partial design — manual |

---

## Sections that need attention

> [!WARNING]
> Review these before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 2 | _Login to My Account card on the hero_ | No starter component for an in-hero login form | Static card in the Carousel **Pseg** variant (no real auth) |
| 4 | _Two buttons per card_ | Two Column CTA has one link per column | **PsegAccountCards** variant with a second CTA |
| 9 | _Category link list on the right_ | Promo CTA expects an image, not a link list | **PsegSavings** variant; list can live in Rich Text if you skip pixel-perfect |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 2 | Carousel | Pseg (custom) | Navy gradient + award + login card is unique to PSE&G |
| 3 | Four Column CTA | PsegQuickLinks | Screenshot tiles are text boxes, not image cards |
| 4 | Two Column CTA | PsegAccountCards | Image-top cards with dual buttons |
| 5 | Promo CTA | PsegBusiness | Overlay panel on a full-bleed photo |
| 8 | CTA Banner | PsegAppointment | Muted split with CSR photo |
| 9 | Promo CTA | PsegSavings | Navy band with link list instead of image |
| 10 | Promo CTA | PsegCommunity | Large photo left, community copy right |
| 11 | Promo CTA | PsegStorm | Text left, kit photo right |

---

## Components by type

### Will be added or rewired automatically (API-addable)

| # | Component | Datasource needed | On Home today? |
|---|-----------|-------------------|----------------|
| 2 | Carousel | PSEG - Hero Carousel | Yes — rewire |
| 3 | Four Column CTA | PSEG - Quick Links | Yes — rewire |
| 4 | Two Column CTA | PSEG - Account Cards | Yes — rewire |
| 5 | Promo CTA | PSEG - Business Needs | Yes — rewire |
| 6 | Heading CTA | PSEG - WorryFree Intro | No — add |
| 7 | Three Column CTA | PSEG - WorryFree Services | Yes — rewire |
| 8 | CTA Banner | PSEG - Make an Appointment | No — add |
| 9 | Promo CTA | PSEG - Energy Savings | Yes — rewire |
| 10 | Promo CTA | PSEG - Powering the Future | Yes — rewire |
| 11 | Promo CTA | PSEG - Storm Preparation | Need 4th Promo CTA — add or reuse |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Swap logo, utility links, nav items, icon shortcuts |
| 12 | Footer | Footer partial design | Update columns, social, legal, logo |

### Custom components needed

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| 2 | Hero login card | Approximate in Carousel Pseg variant | Username/password labels are static; LOGIN / REGISTER as links |

---

## Home page cleanup (PLAY! Financial leftovers)

These are on Home today and are **not** in the PSEG plan. They cannot be removed via MCP:

- Comparison × 2
- Five Column CTA
- Article List
- Documents List
- App Promo

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items under Utilities/pseg):
  1. Carousel — PSEG - Hero Carousel
  2. FourColumnCta — PSEG - Quick Links
  3. TwoColumnCta — PSEG - Account Cards
  4. PromoCta — PSEG - Business Needs
  5. HeadingCta — PSEG - WorryFree Intro
  6. ThreeColumnCta — PSEG - WorryFree Services
  7. CtaBanner — PSEG - Make an Appointment
  8. PromoCta — PSEG - Energy Savings
  9. PromoCta — PSEG - Powering the Future
  10. PromoCta — PSEG - Storm Preparation

Phase 2 — Apply theme (navy/orange CSS variables + Source Sans 3)

Phase 3 — Custom variants (if approved) for Carousel, FourColumnCta, TwoColumnCta, PromoCta ×4, CtaBanner, HeadingCta, Header, Footer

Phase 4 — Assemble Home page + wire datasources
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic starter variants sufficient?

> Reply **approved** to proceed, or describe any changes needed.

# Huron Consulting Group — Build Plan

> **Source:** https://www.huronconsultinggroup.com/en  
> **Analyzed:** 2026-07-15  
> **Sections:** 9 (8 template, 1 custom approximate)  
> **Environment:** `/sitecore/content/consulting/huronconsulting`  
> **Note:** UIIM `fmc-custom-demo` library is not deployed — using starter kit components (same approach as the Progressive demo).

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Aubergine bar with HURON logo, utility links, main nav, red search_ | Header | Default | High | Partial design — manual |
| 2 | _Full-bleed photo of professional at monitor; "Power enterprise growth with Huron +AI"; Explore CTA_ | Hero | Default → Huron | High | Custom variant recommended |
| 3 | _"Your challenges, our priorities" with two dropdowns (Industry / Capabilities)_ | Heading CTA | Default → HuronChallenges | Medium | Dropdowns approximated |
| 4 | _"Meet the moment. Own the future." + video thumbnail card with play button_ | Promo CTA | Default → Huron | High | |
| 5 | _"Transformation that sticks" + four mint→teal columns (Strategy, Operations, Tech, People)_ | Heading CTA + Four Column CTA | HuronTransformation | High | Two datasources |
| 6 | _Event card over office photo — What's Right in Health Care®_ | CTA Banner | Default → Huron | High | |
| 7 | _Insights grid — featured AI article + three stacked stories_ | Heading CTA + Three Column CTA | HuronInsights | Medium | Layout needs custom variant |
| 8 | _"Let's connect" white card with Start the conversation_ | CTA Banner | HuronConnect | High | |
| 9 | _Aubergine mega footer with mission, links, social, global CTA_ | Footer | Default | High | Partial design — manual |

---

## Sections that need attention

> [!WARNING]
> Review these before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Industry expertise / Capabilities dropdowns_ | No starter component for cascading filters | Heading CTA for headline; static links or custom BYOC for filters |
| 7 | _Featured insight + stacked list_ | Three Column CTA is a flat 3-up grid | Custom HuronInsights variant (or featured Promo + list) |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 2 | Hero | Huron (custom) | Full-bleed photo + left type stack matches live hero |
| 3 | Heading CTA | HuronChallenges | Centered on aubergine with dark band styling |
| 4 | Promo CTA | Huron | Video card / play badge on right |
| 5 | Four Column CTA | HuronTransformation | Vertical mint→teal capability columns |
| 6 | CTA Banner | Huron | White overlay card on photo |
| 7 | Three Column CTA | HuronInsights | Featured + stacked list layout |
| 8 | CTA Banner | HuronConnect | Centered connect card |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero | Huron - Hero |
| 3 | Heading CTA | Huron - Challenges |
| 4 | Promo CTA | Huron - Meet the Moment |
| 5a | Heading CTA | Huron - Transformation Intro |
| 5b | Four Column CTA | Huron - Transformation Pillars |
| 6 | CTA Banner | Huron - Health Care Event |
| 7a | Heading CTA | Huron - Insights Intro |
| 7b | Three Column CTA | Huron - Insights |
| 8 | CTA Banner | Huron - Lets Connect |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Update logo + navigation items |
| 9 | Footer | Footer partial design | Update copy, links, social |

### Custom components needed

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| 3 | Dual challenge selectors | Approximate first; optional BYOC later | Industry label, Capability label, links |

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. Hero — Huron - Hero
  2. HeadingCta — Huron - Challenges
  3. PromoCta — Huron - Meet the Moment
  4. HeadingCta — Huron - Transformation Intro
  5. FourColumnCta — Huron - Transformation Pillars
  6. CtaBanner — Huron - Health Care Event
  7. HeadingCta — Huron - Insights Intro
  8. ThreeColumnCta — Huron - Insights
  9. CtaBanner — Huron - Lets Connect

Phase 2 — Apply theme (CSS variables + Bricolage Grotesque / Roboto)

Phase 3 — Custom variants (if approved) for Hero, PromoCta, FourColumnCta, CtaBanner ×2, ThreeColumnCta

Phase 4 — Assemble Home page + wire datasources
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Compare the table against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic starter variants sufficient?

> Reply **approved** to proceed, or describe any changes needed.

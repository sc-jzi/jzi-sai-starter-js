# Pentair Pool — Demo Build Summary

> **Client:** Pentair Pool  
> **Source:** https://www.pentair.com/en-us/pool-spa.html  
> **Built:** 2026-08-25  
> **Page:** `/sitecore/content/pentair/pentairpool/Home` `{967820FE-3E91-4249-834A-1FB9EEDEC2EC}`

Pixel-perfect variants, theme tokens, Barlow fonts, and all datasource items are ready. **Page assembly must be finished in Pages** — Agent API layout reads/writes (`get_components_on_page`, `add_component_on_page`) returned HTTP 500.

---

## Build Overview

| Metric | Count |
|--------|-------|
| Template components used | 10 (Header, Hero, HeadingCta, FourColumnCta, TwoColumnCta, FiveColumnCta, PromoCta, CtaBanner, AppPromo, Footer) |
| Custom components built | 0 |
| Custom variants created | 14 named exports |
| Datasource items created | 19 |
| Images uploaded | 23 / 23 |

---

## Component Inventory

| # | Component | Variant | Datasource | Status |
|---|-----------|---------|------------|--------|
| 1 | Header | PentairPool | _partial design_ | ⚠️ Set variant on Header partial |
| 2 | Hero | PentairPool | Pentair Pool - Hero `{BB6CDAA6-...}` | ⚠️ Add + wire in Pages |
| 3 | Heading CTA | PentairPoolIntro | Pentair Pool - Intro `{E9DABD56-...}` | ⚠️ Add + wire in Pages |
| 4 | Four Column CTA | PentairPoolProducts | Featured Products `{D00B6144-...}` | ⚠️ Add + wire in Pages |
| 5 | Two Column CTA | PentairPoolPersonas | Personas `{D517C85A-...}` | ⚠️ Add + wire in Pages |
| 6 | Five Column CTA | PentairPoolResources | Resources `{9761C217-...}` | ⚠️ Add + wire in Pages |
| 7 | Heading CTA | PentairPoolSolutionsHead | Solutions Heading `{F6E1F662-...}` | ⚠️ Add + wire in Pages |
| 8 | Promo CTA | PentairPoolSplit | Pumps `{D3E27E6D-...}` | ⚠️ Add + wire in Pages |
| 9 | Promo CTA | PentairPoolSplitAlt | Automation `{A3C72F19-...}` | ⚠️ Add + wire in Pages |
| 10 | Promo CTA | PentairPoolSplit | Lighting `{2D779513-...}` | ⚠️ Add + wire in Pages |
| 11 | Promo CTA | PentairPoolSplitAlt | Filtration `{B1CFDF96-...}` | ⚠️ Add + wire in Pages |
| 12 | Promo CTA | PentairPoolSplit | Heating `{553790B1-...}` | ⚠️ Add + wire in Pages |
| 13 | Promo CTA | PentairPoolSplitAlt | Treatment `{94AB0171-...}` | ⚠️ Add + wire in Pages |
| 14 | Four Column CTA | PentairPoolIcons | More Products 1 `{CDE3370F-...}` | ⚠️ Add + wire in Pages |
| 15 | Four Column CTA | PentairPoolIcons | More Products 2 `{C1351B94-...}` | ⚠️ Add + wire in Pages |
| 16 | Two Column CTA | PentairPoolPartners | Rebates `{07E1220B-...}` | ⚠️ Add + wire in Pages |
| 17 | CTA Banner | PentairPoolEdu | Understand Equipment `{5FB65017-...}` | ⚠️ Add + wire in Pages |
| 18 | CTA Banner | PentairPoolDealer | Find a Dealer `{F7BC604F-...}` | ⚠️ Add + wire in Pages |
| 19 | App Promo | PentairPoolApp | App `{B2241EAF-...}` | ⚠️ Add + wire in Pages |
| 20 | Footer | PentairPool | Footer `{8084C099-...}` | ⚠️ Set variant + datasource on Footer partial |

---

## Theme

| Property | Value |
|----------|-------|
| Primary color | `#09244F` |
| Secondary / teal | `#006E96` |
| Accent / leaf green | `#4F8309` |
| CTA green | `#6EB70B` |
| Heading font | Barlow Condensed 300, uppercase |
| Body font | Barlow 400 |
| Delivery method | `.site-pentairpool` tokens in `_colors.scss` + `_pentair-pool-demo.scss` |
| Google Fonts | Loaded from `_fonts.scss` and `src/app/layout.tsx` |

Site name in preview is **`pentairpool`**. `getSiteThemeClass` maps `pentairpool` / `PentairPool` → `site-pentairpool`.

> Theme takes effect on the next rendering-host restart.

---

## Image Upload Summary

**Content Hub:** `https://jzi-verticals.sitecoresandbox.cloud/`

| Result | Count |
|--------|-------|
| Uploaded + approved | 23 |
| Failed | 0 |
| Skipped (50MB hero GIF) | 1 |
| **Total attempted** | **23** |

Image fields are already set on the shared datasource items under `Data/Promos`.

---

## Manual Tasks

See `manual-tasks.md` and `variant-checklist.md`.

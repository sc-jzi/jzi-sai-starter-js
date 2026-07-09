# Progressive Insurance — Build Plan

> **Source:** https://www.progressive.com/
> **Analyzed:** July 7, 2026
> **Sections:** 8 (7 template, 1 custom approximation)
> **Environment:** Financial / ProsperaFinancial starter kit

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _White header with Progressive logo, nav links, phone number, Log in, Español_ | Header | Default | High | Partial design — manual |
| 2 | _Full-bleed family campfire photo with "Welcome to Progressive Insurance®" headline_ | Hero | Default | High | Datasource created |
| 3 | _White quote card with ZIP field and four product icon boxes_ | Four Column CTA | Default | Medium | ZIP form approximated as product cards |
| 4 | _"A leading insurance company, trusted since 1937" intro paragraph_ | Heading CTA | Default | High | Datasource created |
| 5 | _Three stat boxes: $900+ savings, 43 million+ customers, 24/7/365 support_ | Stats Counter | Default | High | Datasource created |
| 6 | _House/car illustration with insurance product list and Explore CTA_ | Features | Default | Medium | 2 of 5 products in component fields |
| 7 | _"See why we're Progressive" — four photo cards (Bundling, D&I, Resources, Careers)_ | Heading CTA + Four Column CTA | Default | High | Datasources created |
| 8 | _Multi-column footer with links, search, social, legal text_ | Footer | Default | High | Partial design — manual |

---

## Sections that need attention

> [!WARNING]
> These sections have low confidence or need custom work.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Interactive ZIP quote widget on hero_ | No template supports form overlay on hero | Four Column CTA approximates product icons; custom QuoteWidget for pixel-perfect |
| 6 | _Five insurance product links with descriptions_ | Features component only has 2 item slots | Show top 2 products; list others in rich text intro |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Header | Default | Solid white header bar with logo and links |
| 2 | Hero | Default | Full-bleed background image with text overlay |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource |
|---|-----------|------------|
| 2 | Hero | Progressive - Hero |
| 3 | Four Column CTA | Progressive - Quote Products |
| 4 | Heading CTA | Progressive - Trust Intro |
| 5 | Stats Counter | Progressive - Stats |
| 6 | Features | Progressive - Products |
| 7 | Heading CTA | Progressive - Why Intro |
| 7 | Four Column CTA | Progressive - Why Progressive |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Header | Header partial design | Update logo and nav links in Content Editor |
| 8 | Footer | Footer partial design | Update footer link columns |

### Custom components needed

None required — quote widget approximated with Four Column CTA.

---

## Build Order

```
Phase 1 — Sitecore content (datasources created):
  1. Hero → Progressive - Hero
  2. FourColumnCta → Progressive - Quote Products
  3. HeadingCta → Progressive - Trust Intro
  4. StatsCounter → Progressive - Stats
  5. Features → Progressive - Products
  6. HeadingCta → Progressive - Why Intro
  7. FourColumnCta → Progressive - Why Progressive

Phase 2 — Theme (already applied via src/assets/progressive/)

Phase 3 — Page assembly (manual — API unavailable)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?**
2. **Do you want pixel-perfect custom variants** for the quote widget and stat boxes, or are the starter kit components sufficient?

> Reply **"approved"** to proceed with manual page assembly, or describe changes needed.

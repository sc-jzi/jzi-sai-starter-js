# Wake Forest University — Build Plan

> **Source:** https://www.wfu.edu/
> **Analyzed:** July 7, 2026
> **Sections:** 12 (11 template, 1 custom)

---

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Dark top bar with white WFU wordmark, MENU and SEARCH icons over the hero_ | Navigation Header | Transparent | High | Context-only — manual placement in header partial |
| 2 | _Full-bleed aerial campus photo with centered "Welcome to Wake Forest" headline_ | Hero Banner | BackgroundImage | High | |
| 3 | _Beige band with three gold rectangular CTAs: Majors & Minors, Schedule a Visit, Apply Now_ | Tab Navigation Section | Boxed | Medium | Gold button row — custom variant likely needed |
| 4 | _Split "Wake Up" section — lab photo with bold overlay left, dark mission text + ghost CTA right_ | Feature Highlight | Default | High | Custom variant for overlay typography + ghost button |
| 5 | _News grid — large featured president story left, two smaller stories right, link row below_ | Feature Cards Grid | WithImages | Medium | Asymmetric news layout needs custom variant |
| 6 | _Stone seal photo left, "Our motto means more" + Pro Humanitate text right_ | Feature Highlight | Default | High | Second Feature Highlight instance |
| 7 | _"Why Wake Forest?" dark panel with three gold sub-headings left, autumn campus photo right_ | Value Proposition Grid | Horizontal | Medium | Campus photo is adjacent — custom split variant |
| 8 | _"By the Numbers" carousel with rotating stats and dot navigation_ | Trust Stats Row | Default | High | Carousel behavior needs custom variant |
| 9 | _Colleges & Schools link grid (7 schools)_ | Feature Cards Grid | Default | High | Below fold |
| 10 | _Instagram "Around Campus" social feed embed_ | **Custom** | — | Low | Skip or substitute Image Gallery |
| 11 | _"Welcome to Deactown" athletics banner with Visit Athletics CTA_ | CTA Banner | WithImage | High | Below fold |
| 12 | _Multi-column footer with link groups, giving CTAs, address_ | Site Footer | MegaFooter | High | Context-only — manual placement in footer partial |

---

## Sections that need attention

> [!WARNING]
> These sections have low confidence or need custom work. Review before approving.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Three gold CTA buttons in a row_ | Tab Navigation doesn't look like buttons | Phase 5.5 WakeForest variant on TabNavigationSection |
| 5 | _Asymmetric news layout_ | Feature Cards Grid is symmetric | Phase 5.5 WakeForest variant — featured + sidebar |
| 7 | _Split dark panel + campus photo_ | Value Proposition Grid has no image half | Phase 5.5 WakeForest split variant, or pair with Image Gallery |
| 8 | _Stats carousel with dots_ | Trust Stats Row is static | Phase 5.5 WakeForest carousel variant |
| 10 | _Instagram feed embed_ | No template for social widgets | **Skip** for demo, or substitute campus photo gallery |

---

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 1 | Navigation Header | Transparent | Logo and icons overlay the hero image on a dark bar |
| 2 | Hero Banner | BackgroundImage | Full-bleed campus photography with centered text overlay |
| 3 | Tab Navigation Section | Boxed | Closest match for horizontal row of rectangular gold buttons |
| 5 | Feature Cards Grid | WithImages | News cards with portrait and landscape images |
| 7 | Value Proposition Grid | Horizontal | Gold headings with descriptions stacked on dark background |
| 11 | CTA Banner | WithImage | Athletics section with background imagery |
| 12 | Site Footer | MegaFooter | Multi-column links, giving promos, and contact info |

---

## Components by type

### Will be added automatically (API-addable)

| # | Component | Datasource needed |
|---|-----------|------------------|
| 2 | Hero Banner | Simple (1 item) |
| 3 | Tab Navigation Section | List (parent + 3 children) |
| 4 | Feature Highlight (Wake Up) | Simple (1 item) |
| 5 | Feature Cards Grid (News) | List (parent + 3 children) |
| 6 | Feature Highlight (Motto) | Simple (1 item) |
| 7 | Value Proposition Grid | List (parent + 3 children) |
| 8 | Trust Stats Row | List (parent + 4 children) |
| 9 | Feature Cards Grid (Colleges) | List (parent + 7 children) |
| 11 | CTA Banner | Simple (1 item) |

### Must be placed manually

| # | Component | Where it lives | What to do |
|---|-----------|---------------|------------|
| 1 | Navigation Header | Header partial design | Assign datasource in Content Editor |
| 12 | Site Footer | Footer partial design | Assign datasource in Content Editor |

### Custom components needed

| # | What's on the page | Suggested approach | Fields needed |
|---|-------------------|-------------------|---------------|
| 10 | Instagram "Around Campus" feed | **Skip** — no template supports social embeds | N/A — substitute Image Gallery if needed |

---

## Build Order

```
Phase 1 — Sitecore content (create datasource items):
  1. HeroBanner
  2. TabNavigationSection (3 CTAs)
  3. FeatureHighlight (Wake Up)
  4. FeatureCardsGrid (News — 3 stories)
  5. FeatureHighlight (Motto)
  6. ValuePropositionGrid (3 value props)
  7. TrustStatsRow (4 stats)
  8. FeatureCardsGrid (Colleges — 7 schools)
  9. CTABanner (Athletics)

Phase 2 — Apply theme (CSS variables + Google Fonts)

Phase 3 — Custom components: none (Instagram section skipped)

Phase 5.5 — Custom variants recommended for 6 sections (nav, CTAs, news, why WFU, stats, footer)
```

---

## Approval Questions

1. **Does the section-to-component mapping look correct?** Look at the table above and compare against the screenshot.
2. **Do you want pixel-perfect custom variants** (Phase 5.5) or are the generic template variants sufficient?

> Reply "approved" to proceed, or describe any changes needed.

# Gallagher Bassett Technical Services Training — Build Plan

> **Source:** https://www.gbtstraining.com/  
> **Analyzed:** September 9, 2026  
> **Sections:** 12 (12 template matches, 0 custom components)

## Page Sections (top to bottom)

| # | What's on the page | What we'll use | Variant | Confidence | Notes |
|---|-------------------|----------------|---------|------------|-------|
| 1 | _Thin navy provider and phone utility bar_ | Eyebrow | Default | High | Shared header placement |
| 2 | _White logo row with compact dropdown navigation_ | Header | WithLogoImage | High | Shared header placement |
| 3 | _Dark network-image hero with centered copy and three cyan buttons_ | Hero | Default → GbtsMultiCta | High | Extend from one CTA to three |
| 4 | _Raised aqua “Now Enrolling” panel with five course offers_ | Five Column CTA | Default → GbtsEnrollmentPanel | Medium | Text-only 3+2 layout and shared heading |
| 5 | _Blue Worker Wallet banner with construction workers at right_ | CTA Banner | LargeImage → GbtsCompactSplit | High | Compact the existing split layout |
| 6 | _Training Courses heading and three colored icon cards_ | Three Column CTA | WithIconsCompact → GbtsCourseCategories | High | Add chevron treatment |
| 7 | _Most Popular Training Courses using the same three-card row_ | Three Column CTA | WithIconsCompact → GbtsCourseCategories | High | Separate datasource |
| 8 | _Small centered View All Courses button_ | Heading CTA | Compact → GbtsButtonOnly | Medium | Render only the authorable link |
| 9 | _Blue training CTA with a construction-site image_ | CTA Banner | LargeImage → GbtsCompactSplit | High | Reuse the Worker Wallet treatment |
| 10 | _Navy testimonial band with two visible quote panels_ | Testimonials | Default → GbtsTwoUpNavy | High | Two desktop panels |
| 11 | _Benefits list over a dark construction photograph_ | Parallax Banner | Default | High | Exact template match |
| 12 | _Compact white legal footer with utility and policy links_ | Footer | Default → GbtsMinimalLegal | High | Shared footer placement |

## Sections that need attention

> [!NOTE]
> All sections match existing GBTS components. No new rendering is required. Seven existing components need GBTS-specific variants for close visual fidelity.

| # | What's on the page | Issue | Suggestion |
|---|-------------------|-------|------------|
| 3 | _Three hero buttons_ | Hero currently exposes one Link field | Create `GbtsMultiCta`; use the existing editable fields and extend the datasource only if three independently authored links are required |
| 4 | _Five text-only enrollment offers_ | Default Five Column CTA is image-led | Create `GbtsEnrollmentPanel` |
| 6–7 | _Course cards with dropdown affordances_ | Existing compact icon cards have no chevrons | Create one reusable `GbtsCourseCategories` variant |
| 12 | _Very compact legal footer_ | Existing footer is a larger multi-column layout | Create `GbtsMinimalLegal` |

## Variant Decisions

| # | Component | Variant | Why this variant |
|---|-----------|---------|-----------------|
| 2 | Header | WithLogoImage | The Gallagher Bassett logo is visible |
| 5, 9 | CTA Banner | LargeImage / GbtsCompactSplit | Both sections use a compact text/image split |
| 6, 7 | Three Column CTA | WithIconsCompact / GbtsCourseCategories | The course categories are dense icon cards |
| 8 | Heading CTA | Compact / GbtsButtonOnly | The reference shows only a small centered action |

## Components by type

### Will be added automatically

| # | Component | Datasource needed |
|---|-----------|------------------|
| 3 | Hero | Simple item |
| 4 | Five Column CTA | Simple item with five offer slots |
| 5 | CTA Banner — Worker Wallet | Simple item |
| 6 | Three Column CTA — Training Courses | Simple item with three card slots |
| 7 | Three Column CTA — Popular Courses | Simple item with three card slots |
| 8 | Heading CTA | Simple item |
| 9 | CTA Banner — Training | Simple item |
| 10 | Testimonials | Parent plus two testimonial children |
| 11 | Parallax Banner | Simple item |

### Must be placed or finalized manually

| # | Component | Where it lives | What to do |
|---|-----------|----------------|------------|
| 1 | Eyebrow | Header partial design | Confirm provider copy, language selector, and phone placeholders |
| 2 | Header | Header partial design | Confirm logo/navigation and choose `WithLogoImage` |
| 12 | Footer | Footer partial design | Assign the GBTS footer datasource and `GbtsMinimalLegal` variant |

### Custom components needed

None — all sections matched existing GBTS components.

## Build Order

1. Create English datasource items in the required `/sitecore/content/education/gbts/Data` subfolders.
2. Upload and wire the reference imagery through Content Hub.
3. Apply the approved navy/cyan/aqua theme and Open Sans typography.
4. Create the seven reusable GBTS demo variants.
5. Assemble and wire the existing Home page in screenshot order.
6. Complete manual shared-layout and variant selections listed in `manual-tasks.md`.

## Approval Questions

1. **Does the section-to-component mapping look correct?**
2. **Do you want pixel-perfect GBTS variants, or are the generic existing variants sufficient?**

> Reply “approved” and choose the variant approach to proceed.

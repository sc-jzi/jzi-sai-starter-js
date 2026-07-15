# Huron Consulting Group — Demo Summary

> **Source:** https://www.huronconsultinggroup.com/en  
> **Site:** `/sitecore/content/consulting/huronconsulting`  
> **Code:** `industry-verticals/huronconsulting`  
> **Completed:** 2026-07-15

---

## Build Overview

| Metric | Count |
|--------|------:|
| Template / starter components used | 8 (+ Header/Footer) |
| Custom components built | 0 (dropdown filter approximated) |
| Pixel-perfect variants created | 10 |
| Datasource items created | 9 |
| Images downloaded | 9 |
| Images uploaded to Content Hub | 0 (skipped) |
| Page assembly via API | Manual (API blocked) |

---

## Component Inventory

| # | Section | Component | Variant | Datasource | Status |
|---|---------|-----------|---------|------------|--------|
| 1 | Nav | Header | Huron | Partial design | Needs manual variant |
| 2 | Hero | Hero | Huron | Huron - Hero | Ready — place + wire |
| 3 | Challenges | Heading CTA | HuronChallenges | Huron - Challenges | Ready — place + wire |
| 4 | Meet the moment | Promo CTA | Huron | Huron - Meet the Moment | Ready — place + wire |
| 5a | Transformation intro | Heading CTA | Huron | Huron - Transformation Intro | Ready — place + wire |
| 5b | Pillars | Four Column CTA | HuronTransformation | Huron - Transformation Pillars | Ready — place + wire |
| 6 | Event | CTA Banner | Huron | Huron - Health Care Event | Ready — place + wire |
| 7a | Insights intro | Heading CTA | Huron | Huron - Insights Intro | Ready — place + wire |
| 7b | Insights cards | Three Column CTA | HuronInsights | Huron - Insights | Ready — place + wire |
| 8 | Connect | CTA Banner | HuronConnect | Huron - Lets Connect | Ready — place + wire |
| 9 | Footer | Footer | Huron | Partial design | Needs manual variant |

---

## Theme

| Token | Value |
|-------|--------|
| Primary | `#370022` (aubergine) |
| Accent | `#DB354D` |
| Headings | Bricolage Grotesque |
| Body | Roboto |
| Delivery | `src/assets/huron/*.css` + `_huron-demo.scss` via `globals.scss` |
| Site class | `site-huron` (from `getSiteThemeClass`) |

---

## Image Upload Summary

> [!NOTE]
> Content Hub was skipped. Use `images-to-upload.md` and local files under `images/`.

| Status | Count |
|--------|------:|
| Downloaded | 9 |
| Uploaded | 0 |
| Failed | 0 |

---

## Manual Tasks

See **`manual-tasks.md`** (primary checklist) and **`variant-checklist.md`**.

### Personalization (optional)

Create additional datasources named `Huron - <Component> - <Segment>` in the same folders, then assign via Pages personalization rules.

---

## Datasource item IDs

| Name | Item ID |
|------|---------|
| Huron - Hero | `5d3180c7-be49-4495-ae02-c6c23861d227` |
| Huron - Challenges | `b4408e53-22fc-4907-9510-ae9af0d33754` |
| Huron - Meet the Moment | `2e2cd2f3-a8c2-49b1-be81-0aee1e0bd54c` |
| Huron - Transformation Intro | `87aeec6a-c2c1-4fa2-a2a9-ca331b0d3534` |
| Huron - Transformation Pillars | `584b21ad-5565-4914-9828-d3db8f0d6b12` |
| Huron - Health Care Event | `158f058e-b0f5-4aac-beb7-91140da5e43c` |
| Huron - Insights Intro | `20a00891-98a8-4caf-a232-a813f4e40b7e` |
| Huron - Insights | `01fab6e1-145c-46e4-ae3b-257a84859c11` |
| Huron - Lets Connect | `66be5a82-378c-4917-9760-1b5e3f7f5fd3` |

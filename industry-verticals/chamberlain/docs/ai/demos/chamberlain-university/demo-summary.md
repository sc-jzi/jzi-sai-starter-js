# Chamberlain University demo

Replicates [chamberlain.edu](https://www.chamberlain.edu/) on `/sitecore/content/covista/Chamberlain` using the PLAY! Financial library plus one new component.

## What changed from the approved plan

- **Section 5** is a new **ProgramCarousel** rendering, not Four Column CTA. It datasources to `/sitecore/content/covista/Chamberlain/Home/personal` and lists Content Page children (0–n) as a horizontal slider with a progress track and prev/next buttons.
- **Section 10** care cards accept **image or video**. Optional `Video1` / `Video2` / `Video3` File fields were added on the shared Three Column CTA template. ChamberlainCare renders video when present, otherwise the image.
- Pixel-perfect **Chamberlain** variants were created for every section.

## Sitecore items created

- Rendering: `/sitecore/layout/Renderings/Project/Financial/Page Content/ProgramCarousel` `{7C141802-DF99-4105-8063-08003B3B4656}`
- Registered on Available Renderings (Page Content) by append
- Headless variant definitions for all Chamberlain variants
- Datasources under `/sitecore/content/covista/Chamberlain/Data` (`Chamberlain - *`) and matching local `/Home/Data/Chamberlain_*` items populated when the page assembler auto-created them
- FAQ parent + four children at `Chamberlain - FAQ`
- Program tree under `Home/personal`: BSN / MSN / DNP titles, MPAS page, MSN and MPAS grandchild links

## Code

- `src/components/pagecontent/ProgramCarousel.tsx`
- Chamberlain exports on Header, Hero, HeadingCta, ThreeColumnCta, FiveColumnCta, PromoCta, StatsCounter, Accordion, Footer
- Theme tokens in `src/assets/app.css` and `src/assets/sass/abstracts/vars/_colors.scss`
- Fonts: Barlow Condensed, EB Garamond, Source Sans 3

## Remaining work

See `manual-tasks.md`. Highest impact: assign correct variants, add Accordion, drop leftover Financial blocks, upload photography, restart the Chamberlain Next.js app so the component map includes ProgramCarousel.

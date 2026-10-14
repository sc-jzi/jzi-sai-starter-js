# Theme tone → component variant (Prospera)

The theme's `tone.*` fields steer variant choice only where Prospera has real variants. Colors, fonts and radii are applied through the `site-<customer>` theme (see `.cursor/skills/sitecore-reference/references/site-theme-variables.md`), not through variants.

| Theme signal | Effect |
|---|---|
| `tone.heroStyle: full-bleed-image` | `PromoCta` variant `WithBackgroundImage`, or `ParallaxBanner` |
| `tone.heroStyle: split-image-text` | `HeroBanner` / `Hero` (image beside text) |
| `tone.heroStyle: centered-overlay` or `gradient` | `HeadingCta` variant `Centered` above a `Hero` |
| `tone.heroStyle: minimal-text` | `HeadingCta` variant `PageHeading` |
| `tone.heroStyle: video-background` | `Carousel` (has a video field) |
| `tone.cardStyle` | no variant: card shape and shadow come from the theme CSS |
| `tone.navStyle` | no variant: header/footer are partial designs; `Header` has `Default` and `WithLogoImage` |

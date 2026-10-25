# Site theme variables (Prospera app)

Prospera is themed per site with CSS custom properties, not with `--brand-*` variables or a `globals.css` token file.

## How it works
- `src/assets/sass/abstracts/vars/_colors.scss` defines one block per theme: `body.site-financial, .site-financial { ... }` plus a dark block (`body.site-financial.dark, .dark .site-financial { ... }`). `site-services` is the second theme.
- `src/lib/site-theme.ts` maps the Sitecore **site name** to the body class (`SITE_THEME_CLASS_MAP`, default `site-financial`). `SiteTheme` (src/components/utilities) adds that class to `<body>` on the client.
- Components and Sass partials read the variables with `var(--...)`.

## Variables a theme block sets
`--text-body`, `--text-body-inverted`, `--text-colored`, `--text-footer`, `--text-accent`, `--bg-body`, `--bg-footer`, `--bg-main`, `--bg-main-alt`, `--bg-color`, `--bg-saturated`, `--bg-accent`, `--border-color`, `--hr-color`, `--roundness`.
Below the theme blocks the file also derives per-component colors from these (accordion, buttons, carousel, navigation, search, ...). Change the theme blocks, not the derived rules.

## Mapping extracted client values (sitecore-extract-theme)
These pairings are inferred from the Financial theme; check the result visually and adjust.

| Extracted value | Variable |
|---|---|
| body text color | `--text-body` |
| body background | `--bg-body` (and `--text-body-inverted` for text on dark/saturated areas) |
| brand / link color | `--text-colored` and `--bg-saturated` |
| accent color | `--text-accent` and `--bg-accent` |
| light tint of the brand color | `--bg-color` |
| alternate section backgrounds | `--bg-main`, `--bg-main-alt` |
| footer background / text | `--bg-footer` / `--text-footer` |
| border / divider color | `--border-color`, `--hr-color` |
| card or button corner radius | `--roundness` |

Fonts are not part of the theme blocks. Check `src/assets/basic/_fonts.scss` and `src/assets/sass/base/fonts/_fonts.scss` before changing them, and add a Google Fonts `<link>` in `src/app/layout.tsx` only if the client font needs it.

## Adding a customer theme (in the customer's own app copy)
1. Copy the `// Financial` blocks in `_colors.scss`, rename the selectors to `.site-<customer>` (light and dark) and set the values.
2. Add `<SitecoreSiteName>: 'site-<customer>'` to `SITE_THEME_CLASS_MAP` in `src/lib/site-theme.ts`. The key is the exact Sitecore site name from `site.json`.
3. Restart the dev server and check the home page in light and dark.

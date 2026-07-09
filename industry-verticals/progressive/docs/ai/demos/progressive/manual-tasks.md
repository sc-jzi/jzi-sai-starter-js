# Progressive Demo — Manual Assembly Checklist

Open the **Home** page in Sitecore Pages editor and add components in this order.
Remove any existing OOB starter components (RichText, Image, Container) first.

## Component placement order

| # | Add component | Wire datasource | Set variant | Datasource path |
|---|--------------|-----------------|-------------|-----------------|
| 1 | **Hero** | Progressive - Hero | **Progressive** | `/Data/Promos/Progressive - Hero` |
| 2 | **Four Column CTA** | Progressive - Quote Products | **ProgressiveQuote** | `/Data/Promos/Four Column CTA/Progressive - Quote Products` |
| 3 | **Heading CTA** | Progressive - Trust Intro | **Progressive** | `/Data/Promos/Promo CTA/Progressive - Trust Intro` |
| 4 | **Stats Counter** | Progressive - Stats | **Progressive** | `/Data/Promos/Progressive - Stats` |
| 5 | **Features** | Progressive - Products | **Progressive** | `/Data/Promos/Progressive - Products` |
| 6 | **Heading CTA** | Progressive - Why Intro | **Progressive** | `/Data/Promos/Promo CTA/Progressive - Why Intro` |
| 7 | **Four Column CTA** | Progressive - Why Progressive | **ProgressiveTiles** | `/Data/Promos/Four Column CTA/Progressive - Why Progressive` |

See [variant-checklist.md](./variant-checklist.md) for full variant IDs.

## Header & Footer (partial designs)

1. Open **Header** partial design → set variant to **Progressive**
2. Update logo to Progressive logo
3. Update nav links: Insurance & more, Claims, Resources & tools, About us
4. Open **Footer** partial design → set variant to **Progressive**
5. Update link columns to match progressive.com footer

## Page settings

- Set page **Title** field to: `Progressive Insurance`
- Verify page design includes Header and Footer partials

## Theme verification

The Progressive brand theme is already applied via `src/assets/progressive/`:
- Colors: `#003DA5` navy, `#0077B3` action blue
- Typography: 96 Sans (with Arial fallback)
- Run `npm run dev` and browse to the Home page to verify

## Estimated time

~10 minutes for manual assembly in Pages editor.

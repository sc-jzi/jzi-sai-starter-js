# React component guidelines (Prospera app)

Verified against `industry-verticals/prospera` (Next.js App Router, `@sitecore-content-sdk/nextjs`). If a customer copy differs, follow the neighbouring components in that copy.

## Where components live
- Page content components: `src/components/pagecontent/<ComponentName>.tsx` (PascalCase file, one component per file).
- Other folders already in the app: `src/components/pagestructure/` (layout and structure, e.g. ColumnSplitter), `navigation/` (Header, Footer, Navigation, Breadcrumb), `utilities/`, `non-sitecore/` (helpers with no Sitecore data), `content-sdk/`.
- Import aliases: `components/*` and `lib/*` (see `tsconfig.json`), and `src/...` paths. There is no `@/` alias, no `src/components/ui` and no `src/components/uiim`.

## Registration (both maps)
Every new component must be added to **both** maps, next to the existing entries and in the same style:
- `.sitecore/component-map.ts`: `import * as Name from 'src/components/pagecontent/Name';` and `['Name', { ...Name, componentType: 'client' }],` (use `componentType: 'client'` when the file starts with `'use client'`, as most do).
- `.sitecore/component-map.client.ts`: the same import and `['Name', { ...Name }],`.
The key is PascalCase and must equal the Sitecore rendering/component name. Run `node docs/ai/scripts/validate-components.mjs` afterwards.

## Styling: follow what the app already does
- Wrapper: `<div className={`component <kebab-name> ${styles}`} id={RenderingIdentifier}>` with Bootstrap layout inside (`container`, `row`, `col-*`), exactly like `Hero.tsx` and `CtaBanner.tsx`.
- Styles live in Sass partials: `src/assets/sass/components/_component-<kebab-name>.scss`, registered in `src/assets/sass/components/index.scss`. Custom variant styles go under `src/assets/sass/variants/`.
- Colors, backgrounds and radius come from the site theme variables (`--text-*`, `--bg-*`, `--border-color`, `--roundness`), see `site-theme-variables.md`. Do not hard-code hex values in components.
- Tailwind 4 is installed and imported in `src/app/globals.scss`, but the existing components do not rely on it. Use utility classes only for small one-offs.
- Icons: `lucide-react` is a dependency. There is no shadcn/ui, no `cn` helper and no `buttonVariants`; use the app's own button classes (for example `button button-main`).

## Sitecore field rendering: editability is mandatory
Every Sitecore-managed field is rendered with the SDK helper from `@sitecore-content-sdk/nextjs`:

| Field type | Helper |
|---|---|
| Single-Line Text | `Text` |
| Rich Text | `RichText` |
| Image | `NextImage` |
| General Link | `Link` |

Never use plain `<img>`, `next/image`, `<a>`, `next/link`, bare strings, or `dangerouslySetInnerHTML` for fields an author should edit. Aliases such as `NextImage as ContentSdkImage` are fine.

## Edit-mode visibility
Empty fields must stay visible to authors in Pages/Experience Editor. Guard with the editing flag instead of hiding:

```tsx
const { page } = useSitecore();
const isPageEditing = page.mode.isEditing;

{(isPageEditing || fields.Link?.value?.href) && <Link field={fields.Link} className="button button-main" />}
```

## Props
Props extend `ComponentProps` from `lib/component-props` where the neighbouring components do. Use `params.styles` and `params.RenderingIdentifier` on the wrapper. Data shapes:
- Simple datasource: `fields.Title`, `fields.Text`, `fields.Image`, ...
- List datasource (GraphQL): `fields.data.datasource`, children in `fields.data.datasource.children.results`, values via `.jsonValue`.
- Context-only: route fields via `useSitecore()` (`page.layout.sitecore.route.fields`).

## Named exports = variants
Use `export const Default = ...` (never `export default`). Each additional named export is a variant and must match the Variant Definition item name in Sitecore exactly (same casing). Add a non-exported fallback component for the empty (no datasource) state. See `.cursor/skills/sitecore-add-variants/SKILL.md`.

## Example (simple datasource component)

```tsx
'use client';

import { JSX } from 'react';
import { Field, ImageField, RichTextField, LinkField, Text, RichText, Link, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
}

export type PromoBlockProps = ComponentProps & { fields: Fields };

const PromoBlockDefaultComponent = (): JSX.Element => (
  <div className="component promo-block">
    <div className="component-content">
      <span className="is-empty-hint">PromoBlock</span>
    </div>
  </div>
);

export const Default = ({ fields, params }: PromoBlockProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  if (!fields) return <PromoBlockDefaultComponent />;

  return (
    <div className={`component promo-block ${params?.styles || ''}`} id={params?.RenderingIdentifier || undefined}>
      <div className="container">
        <div className="row row-gap-4 align-items-center">
          <div className="col-lg-6">
            <h2 className="title"><Text field={fields.Title} /></h2>
            <RichText field={fields.Text} />
            {(isPageEditing || fields.Link?.value?.href) && <Link field={fields.Link} className="button button-main" />}
          </div>
          <div className="col-lg-6">
            <NextImage field={fields.Image} width={960} height={540} />
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Accessibility
Semantic headings, real links and buttons (no click-only `div`), keyboard-reachable interactive elements, keep visible focus states.

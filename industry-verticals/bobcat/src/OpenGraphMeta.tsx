import { JSX } from 'react';
import { Page } from '@sitecore-content-sdk/nextjs';

/**
 * Open Graph tags for every page, from the page item's own fields (baseOgTitle, baseOgDescription, baseOgImage,
 * baseOgType on the base page template). Rendered once per page by src/Layout.tsx; React moves <meta> tags into the
 * document <head>, so no component has to be placed in Sitecore. A field left empty falls back to the page Title, the
 * metadata description and "website".
 */
type TextField = { value?: string | number };
type ImageField = { value?: { src?: string } };
type OgRouteFields = {
  Title?: TextField;
  baseMetadataDescription?: TextField;
  baseOgTitle?: TextField;
  baseOgDescription?: TextField;
  baseOgType?: TextField;
  baseOgImage?: ImageField;
};

const text = (field?: TextField): string => `${field?.value ?? ''}`.trim();

const OpenGraphMeta = ({ page }: { page: Page }): JSX.Element | null => {
  const fields = page.layout.sitecore.route?.fields as OgRouteFields | undefined;
  if (!fields || page.mode.isEditing) return null;

  const tags: [string, string][] = [
    ['og:title', text(fields.baseOgTitle) || text(fields.Title)],
    ['og:description', text(fields.baseOgDescription) || text(fields.baseMetadataDescription)],
    ['og:image', `${fields.baseOgImage?.value?.src ?? ''}`.trim()],
    ['og:type', text(fields.baseOgType) || 'website'],
  ];

  return (
    <>
      {tags
        .filter(([, content]) => content)
        .map(([property, content]) => (
          <meta key={property} property={property} content={content} />
        ))}
    </>
  );
};

export default OpenGraphMeta;

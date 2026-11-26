import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import client from 'lib/sitecore-client';

/**
 * Product enrichment (catalog plan sections 4 and 7): marketing's additions to a PIM product, kept in Sitecore under
 * `Data/Product Enrichment/<category slug>/<SKU>` and edited in the Product Enrichment Marketplace app. An item exists only
 * once a product is enriched. Read by path (one Edge query, no search) through the app's own context (preview on
 * localhost, R11). Cached briefly and tagged `enrichment:<SKU>`, so a save shows within a minute and
 * POST /api/pim/revalidate shows it at once.
 *
 * Field ownership: the PIM owns the product data and is never overridden; Summary Override replaces the PIM summary;
 * everything else here is enrichment only.
 */
export const ENRICHMENT_ROOT = (
  process.env.PIM_ENRICHMENT_ROOT || '/sitecore/content/Bobcat/bobcat/Data/Product Enrichment'
).replace(/\/$/, '');
const ENRICHMENT_REVALIDATE_SECONDS = 60;

export type DiscontinuedHandling = 'keep' | 'redirect' | 'hide';

export interface Enrichment {
  sku: string;
  marketingTitle: string;
  summaryOverride: string;
  highlights: string[];
  badge: string;
  offerLink: { href: string; text: string } | null;
  metaTitle: string;
  metaDescription: string;
  aeoShortAnswer: string;
  ogImage: { src: string; alt?: string } | null;
  noindex: boolean;
  discontinuedHandling: DiscontinuedHandling;
  featuredAttachments: string[];
}

type EdgeField = { name: string; value?: string | null; jsonValue?: unknown };

const handlingOf = (v: string): DiscontinuedHandling =>
  /redirect/i.test(v) ? 'redirect' : /hide/i.test(v) ? 'hide' : 'keep';
const lines = (v: string) =>
  v
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

const toEnrichment = (sku: string, fields: EdgeField[]): Enrichment => {
  const f = Object.fromEntries(fields.map((x) => [x.name, x]));
  const text = (n: string) => `${f[n]?.value ?? ''}`.trim();
  const link = (f['Offer Link']?.jsonValue as { value?: { href?: string; text?: string } } | undefined)?.value;
  const img = (f['OG Image']?.jsonValue as { value?: { src?: string; alt?: string } } | undefined)?.value;
  return {
    sku: text('SKU') || sku,
    marketingTitle: text('Marketing Title'),
    summaryOverride: text('Summary Override'),
    highlights: lines(text('Highlights')),
    badge: text('Badge'),
    offerLink: link?.href ? { href: link.href, text: link.text || 'View Offers' } : null,
    metaTitle: text('Meta Title'),
    metaDescription: text('Meta Description'),
    aeoShortAnswer: text('AEO Short Answer'),
    ogImage: img?.src ? { src: img.src, alt: img.alt } : null,
    noindex: text('Noindex') === '1',
    discontinuedHandling: handlingOf(text('Discontinued Handling')),
    featuredAttachments: lines(text('Featured Attachments')).map((s) => s.toUpperCase()),
  };
};

const ITEM_QUERY = `query Enrichment($path: String!, $language: String!) {
  item(path: $path, language: $language) { fields(ownFields: true) { name value jsonValue } }
}`;

const readEnrichment = async (categorySlug: string, sku: string): Promise<Enrichment | null> => {
  const data = (await client.getData(ITEM_QUERY, {
    path: `${ENRICHMENT_ROOT}/${categorySlug}/${sku}`,
    language: 'en',
  })) as { item?: { fields?: EdgeField[] } | null };
  return data?.item?.fields ? toEnrichment(sku, data.item.fields) : null;
};

/**
 * The enrichment of one product, or null when it has none. `fresh` (Pages editing) skips the one-minute cache, so a save
 * in the Pages panel shows on the reloaded canvas at once.
 */
export const getEnrichment = cache((categorySlug: string, sku: string, fresh = false) =>
  fresh
    ? readEnrichment(categorySlug, sku)
    : unstable_cache(() => readEnrichment(categorySlug, sku), ['enrichment', categorySlug, sku], {
        revalidate: ENRICHMENT_REVALIDATE_SECONDS,
        tags: ['enrichment', `enrichment:${sku.toUpperCase()}`],
      })()
);

// Experience Edge limits query complexity, so the folders and each folder's items are read in separate, flat queries.
const FOLDERS_QUERY = `query EnrichmentFolders($path: String!, $language: String!) {
  item(path: $path, language: $language) { children(first: 100) { results { name } } }
}`;
const FOLDER_PAGE = 20;
const FOLDER_QUERY = `query EnrichmentFolder($path: String!, $language: String!, $after: String) {
  item(path: $path, language: $language) { children(first: ${FOLDER_PAGE}, after: $after) {
    pageInfo { endCursor hasNext } results { name
    sku: field(name: "SKU") { value } noindex: field(name: "Noindex") { value }
    handling: field(name: "Discontinued Handling") { value } } } }
}`;
type FlagRow = { name: string; sku?: { value?: string }; noindex?: { value?: string }; handling?: { value?: string } };

/** SKU -> the flags that remove a product from the sitemap (noindex, redirect, hide). */
export const getEnrichmentFlags = cache(() =>
  unstable_cache(
    async () => {
      const folders = (await client.getData(FOLDERS_QUERY, { path: ENRICHMENT_ROOT, language: 'en' })) as {
        item?: { children?: { results?: { name: string }[] } } | null;
      };
      const perFolder = await Promise.all(
        (folders?.item?.children?.results ?? []).map(async (f) => {
          const rows: FlagRow[] = [];
          let after: string | null = null;
          for (let page = 0; page < 50; page++) {
            const data = (await client.getData(FOLDER_QUERY, {
              path: `${ENRICHMENT_ROOT}/${f.name}`,
              language: 'en',
              after,
            })) as {
              item?: { children?: { results?: FlagRow[]; pageInfo?: { endCursor?: string; hasNext?: boolean } } } | null;
            };
            rows.push(...(data?.item?.children?.results ?? []));
            const info = data?.item?.children?.pageInfo;
            if (!info?.hasNext || !info.endCursor) break;
            after = info.endCursor;
          }
          return rows;
        })
      );
      const flags = new Map<string, { noindex: boolean; handling: DiscontinuedHandling }>();
      for (const i of perFolder.flat())
        flags.set((i.sku?.value || i.name).toUpperCase(), {
          noindex: i.noindex?.value === '1',
          handling: handlingOf(i.handling?.value ?? ''),
        });
      return [...flags.entries()];
    },
    ['enrichment', 'flags'],
    { revalidate: ENRICHMENT_REVALIDATE_SECONDS, tags: ['enrichment'] }
  )().then((entries) => new Map(entries))
);

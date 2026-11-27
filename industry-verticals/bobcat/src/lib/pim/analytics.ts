import { Page } from '@sitecore-content-sdk/nextjs';
import { getProductBySlug, PimProduct } from './client';
import { Enrichment, getEnrichment } from './enrichment';
import { ProductAnalytics, productOf } from './product-context';

/**
 * Product analytics (catalog plan section 8, personalization): the product a page shows, in the flat shape the CDP events
 * carry (see ProductAnalytics). PIM wildcard pages: from the merged product. Authored product pages (Product template, such
 * as E35): from the PIM product whose slug is the item name within its category (D2), when there is one.
 * Secondary data: if the PIM cannot answer, the page renders without it and the events fall back to the plain page view.
 */
const PRODUCT_TEMPLATE = 'Product';

const text = (v: unknown) => `${(v as { value?: unknown } | undefined)?.value ?? ''}`.trim();

export const toProductAnalytics = (
  p: Pick<PimProduct, 'sku' | 'model' | 'name' | 'status' | 'data_origin' | 'product_kind' | 'msrp' | 'category'> & {
    successor?: { sku: string } | null;
  },
  source: ProductAnalytics['source'],
  e: Enrichment | null,
  hasOffer: boolean
): ProductAnalytics => ({
  sku: p.sku,
  model: p.model,
  product_name: p.name,
  category: p.category?.slug ?? '',
  category_name: p.category?.name ?? '',
  product_kind: p.product_kind,
  status: p.status,
  source,
  data_origin: p.data_origin,
  ...(p.successor?.sku ? { successor_sku: p.successor.sku } : {}),
  ...(p.status === 'active' && p.msrp ? { price: Math.round(p.msrp) } : {}),
  enriched: !!e,
  ...(e?.badge ? { badge: e.badge } : {}),
  has_offer: hasOffer,
});

const withAnalytics = (page: Page, productAnalytics: ProductAnalytics): Page => ({
  ...page,
  layout: {
    ...page.layout,
    sitecore: {
      ...page.layout.sitecore,
      context: { ...page.layout.sitecore.context, productAnalytics } as typeof page.layout.sitecore.context,
    },
  },
});

/** Adds `context.productAnalytics` to a product page (wildcard or authored); any other page is returned unchanged. */
export const attachProductAnalytics = async (page: Page | null, path: string[] | undefined): Promise<Page | null> => {
  const route = page?.layout?.sitecore?.route;
  if (!page || !route) return page;
  const fields = (route.fields ?? {}) as Record<string, unknown>;

  const pim = productOf(page);
  if (pim) {
    const e = pim.category ? await getEnrichment(pim.category.slug, pim.sku).catch(() => null) : null;
    const p = await (pim.category ? getProductBySlug(pim.category.slug, pim.slug).catch(() => null) : null);
    return withAnalytics(
      page,
      toProductAnalytics({ ...pim, msrp: p?.msrp ?? null }, 'pim', e, !!e?.offerLink)
    );
  }

  if (route.templateName !== PRODUCT_TEMPLATE) return page;
  const segments = (path ?? []).map((s) => decodeURIComponent(s).toLowerCase());
  const slug = segments[segments.length - 1];
  const categorySlug = segments[segments.length - 2];
  if (!slug || !categorySlug) return page;
  const p = await getProductBySlug(categorySlug, slug).catch(() => null);
  if (!p) return page;
  const e = await getEnrichment(categorySlug, p.sku).catch(() => null);
  return withAnalytics(page, toProductAnalytics(p, 'authored', e, !!text(fields.OfferText)));
};

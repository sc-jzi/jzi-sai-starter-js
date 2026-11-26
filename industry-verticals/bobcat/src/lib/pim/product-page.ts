import { Page } from '@sitecore-content-sdk/nextjs';
import {
  getCategories,
  getCategoryProducts,
  getCompatibleMachines,
  getMachines,
  getProductBySku,
  getProductBySlug,
  PimCategory,
  PimListedProduct,
  PimProduct,
  PimSpec,
} from './client';
import { MachineOption, ProductContext, productPath } from './product-context';
import { Enrichment, getEnrichment } from './enrichment';

/**
 * Wildcard product pages (catalog plan section 4). Sitecore resolves an unknown slug under a category to that category's
 * `*` item (preview and Edge both do), so a page whose route item is `*` is a PIM product page:
 *  - the slug must be a product of that exact category in the PIM, else 404 (no made-up URLs, no duplicates);
 *  - the PIM product is merged into the route's fields the Product components already read (Title, Subtitle, Summary,
 *    Price, Image1-4, Specs), so authored products (E35) and PIM products render through the same components;
 *  - the product itself goes on `layout.sitecore.context.product`, read by server and client components alike.
 * Authored items always win: Sitecore returns them before the wildcard.
 */

export const WILDCARD_ITEM_NAME = '*';

export const isWildcardPage = (page: Page | null | undefined): boolean =>
  page?.layout?.sitecore?.route?.name === WILDCARD_ITEM_NAME;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "Bobcat E32 Compact Excavator" with model "E32" -> "Compact Excavator" */
const subtitleOf = (p: PimProduct) => {
  const rest = p.name.replace(/^Bobcat\s+/i, '');
  return rest.startsWith(p.model) ? rest.slice(p.model.length).trim() : p.category?.name ?? '';
};

const specLabel = (s: PimSpec) => (s.unit ? `${s.label} (${s.unit})` : s.label);

/** The key-specs table in the same shape as an authored product's Specs field (first column label, second the model). */
const specsTable = (p: PimProduct): string => {
  if (!p.specs?.length) return '';
  const groups = [...new Set(p.specs.map((s) => s.group))];
  const rows = groups
    .flatMap((g) => [
      ...(groups.length > 1 ? [`<tr class="specs-group"><th colspan="2">${esc(g)}</th></tr>`] : []),
      ...p.specs
        .filter((s) => s.group === g)
        .map((s) => `<tr><td>${esc(specLabel(s))}</td><td>${esc(String(s.value ?? ''))}</td></tr>`),
    ])
    .join('');
  return `<table><thead><tr><th>Key Specs</th><th>${esc(p.model)}</th></tr></thead><tbody>${rows}</tbody></table>`;
};

const image = (src: string | null | undefined, alt: string) => (src ? { value: { src, alt } } : undefined);

/** Price only for current models (a discontinued page shows none); D4: the PIM price is labelled illustrative. */
const priceOf = (p: PimProduct) =>
  p.status === 'active' && p.msrp ? `$${Math.round(p.msrp).toLocaleString('en-US')} USD (illustrative)` : '';

/** Merges the PIM product into a wildcard page (a copy; the cached Sitecore page is not mutated). */
const highlightsHtml = (lines: string[]) => (lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : '');

export const mergeProduct = (
  page: Page,
  p: PimProduct,
  extra: Partial<ProductContext> = {},
  e: Enrichment | null = null
): Page => {
  const route = page.layout.sitecore.route!;
  const f = (route.fields ?? {}) as Record<string, unknown>;
  const gallery = (p.gallery_urls ?? []).filter(Boolean);
  const subtitle = subtitleOf(p);
  const fields: Record<string, unknown> = {
    ...f,
    Title: { value: p.model },
    NavigationTitle: { value: p.model },
    Subtitle: { value: subtitle },
    // PIM default, enrichment overrides when filled
    Summary: { value: e?.summaryOverride || (p.summary ? `<p>${esc(p.summary)}</p>` : '') },
    // enrichment only
    Highlights: { value: highlightsHtml(e?.highlights ?? []) },
    Overview: { value: e?.aeoShortAnswer ? `<p>${esc(e.aeoShortAnswer)}</p>` : '' },
    OffersLink: e?.offerLink ? { value: { href: e.offerLink.href, text: e.offerLink.text, linktype: 'internal' } } : f.OffersLink,
    Price: { value: priceOf(p) },
    Specs: { value: specsTable(p) },
    // images are PIM-driven: never the wildcard's own (editable) Image fields, so Pages shows no empty slots for them
    Image1: image(p.hero_image_url, `Bobcat ${p.model} ${subtitle}`.trim()),
    Image2: image(gallery[0], `Bobcat ${p.model}`),
    Image3: image(gallery[1], `Bobcat ${p.model}`),
    Image4: image(gallery[2], `Bobcat ${p.model}`),
    baseOgTitle: { value: e?.metaTitle || `${p.name} | Bobcat Company` },
    baseOgDescription: { value: e?.metaDescription || p.summary || '' },
    // social image: the one picked in the enrichment app (Cloudinary), else the PIM hero image
    ...(e?.ogImage
      ? { baseOgImage: { value: e.ogImage } }
      : p.hero_image_url
        ? { baseOgImage: { value: { src: p.hero_image_url, alt: `Bobcat ${p.model}` } } }
        : {}),
    baseOgType: { value: 'product' },
  };
  const product: ProductContext = {
    sku: p.sku,
    slug: p.slug,
    model: p.model,
    name: p.name,
    status: p.status,
    data_origin: p.data_origin,
    product_kind: p.product_kind,
    model_years: p.model_years ?? null,
    discontinued_on: p.discontinued_on ?? null,
    successor: p.successor ?? null,
    category: p.category,
    enrichment: e
      ? { marketingTitle: e.marketingTitle, badge: e.badge, metaTitle: e.metaTitle, metaDescription: e.metaDescription, noindex: e.noindex }
      : null,
    ...extra,
  };
  return {
    ...page,
    layout: {
      ...page.layout,
      sitecore: {
        ...page.layout.sitecore,
        context: { ...page.layout.sitecore.context, product } as typeof page.layout.sitecore.context,
        route: { ...route, displayName: p.model, fields: fields as typeof route.fields },
      },
    },
  };
};

/**
 * The product page for a PIM product: enrichment, discontinued handling, and for an attachment the machines it fits.
 * `editing` (Pages): no redirect and no "Hide", so authors always see the layout with a real product in it.
 */
const buildProductPage = async (page: Page, product: PimProduct, editing = false): Promise<Page | null> => {
  const categorySlug = product.category?.slug ?? '';
  // Marketing's enrichment (secondary: without it the page shows the PIM data alone)
  const e = categorySlug ? await getEnrichment(categorySlug, product.sku, editing).catch(() => null) : null;
  if (!editing && product.status === 'discontinued' && e?.discontinuedHandling === 'hide') return null;
  if (!editing && product.status === 'discontinued' && e?.discontinuedHandling === 'redirect' && product.successor) {
    return mergeProduct(page, product, { redirectTo: productPath(product.successor) }, e);
  }
  if (product.product_kind !== 'attachment') return mergeProduct(page, product, {}, e);

  // An attachment: the machines it fits ("Works with") and every machine (the "Fits my machine?" check), from the PIM
  const toOption = (m: { sku: string; slug: string; model: string; name: string; status: MachineOption['status']; category_path: string }): MachineOption => ({
    sku: m.sku, slug: m.slug, model: m.model, name: m.name, status: m.status, category_path: m.category_path,
  });
  // Secondary data: if the PIM cannot answer (rate limit, outage), the page renders without these sections, never a 500
  const [fits, machines] = await Promise.all([
    getCompatibleMachines(product.sku).catch(() => null),
    getMachines().catch(() => null),
  ]);
  if (!fits || !machines) return mergeProduct(page, product, {}, e);
  return mergeProduct(page, product, {
    worksWith: { current: fits.current.map(toOption), previous: fits.previous.map(toOption) },
    machines: machines
      .filter((m) => m.status === 'active' || m.status === 'discontinued')
      .map(toOption)
      .sort((a, b) => Number(a.status !== 'active') - Number(b.status !== 'active')),
  }, e);
};

/**
 * For a wildcard page: the merged page, or null when the slug is not a PIM product of that category (the caller 404s).
 * Any other page is returned unchanged.
 */
export const resolveProductPage = async (page: Page | null, path: string[] | undefined): Promise<Page | null> => {
  if (!page || !isWildcardPage(page)) return page;
  const segments = (path ?? []).map((s) => decodeURIComponent(s).toLowerCase());
  const slug = segments[segments.length - 1];
  const categorySlug = segments[segments.length - 2];
  if (!slug || !categorySlug || slug === ',-w-,' || slug === WILDCARD_ITEM_NAME) return null;
  const product = await getProductBySlug(categorySlug, slug);
  // The category's Sitecore path must be the requested parent path, so a product has exactly one URL.
  const parent = `/${segments.slice(0, -1).join('/')}`;
  if (!product || product.category?.sitecore_path?.toLowerCase() !== parent) return null;
  return buildProductPage(page, product);
};

/**
 * Pages editing (catalog plan section 4, "Editing in Pages"): a wildcard item renders the PIM product named in its
 * `Preview SKU` field, so authors see a real machine while they edit the layout; with no Preview SKU (or an unknown one),
 * the category's first current product. PIM values are not Sitecore fields, so Pages shows them read-only. If nothing
 * can be found the wildcard item renders as it is. Any other page is returned unchanged.
 */
export const resolvePreviewProductPage = async (page: Page | null): Promise<Page | null> => {
  if (!page || !isWildcardPage(page)) return page;
  const fields = (page.layout.sitecore.route?.fields ?? {}) as Record<string, { value?: unknown } | undefined>;
  const previewSku = `${fields['Preview SKU']?.value ?? ''}`.trim().toUpperCase();
  let product = previewSku ? await getProductBySku(previewSku).catch(() => null) : null;
  if (!product || product.status === 'draft') {
    // the wildcard's category, from its item path (".../compact-excavators/*" or "/,-w-,")
    const ctx = page.layout.sitecore.context as { itemPath?: string } | undefined;
    const parent = `${ctx?.itemPath ?? ''}`.replace(/\/(\*|,-w-,)$/i, '').toLowerCase();
    const category = parent ? (await getCategories().catch((): PimCategory[] => [])).find((c) => c.sitecore_path?.toLowerCase() === parent) : undefined;
    const first = category
      ? (await getCategoryProducts(category.slug).catch((): PimListedProduct[] => [])).find((p) => p.status === 'active')
      : undefined;
    product = first ? await getProductBySku(first.sku).catch(() => null) : null;
  }
  if (!product) return page;
  return (await buildProductPage(page, product, true)) ?? page;
};

import { Page } from '@sitecore-content-sdk/nextjs';
import { getCompatibleMachines, getMachines, getProductBySlug, PimProduct, PimSpec } from './client';
import { MachineOption, ProductContext } from './product-context';

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
export const mergeProduct = (page: Page, p: PimProduct, extra: Partial<ProductContext> = {}): Page => {
  const route = page.layout.sitecore.route!;
  const f = (route.fields ?? {}) as Record<string, unknown>;
  const gallery = (p.gallery_urls ?? []).filter(Boolean);
  const subtitle = subtitleOf(p);
  const fields: Record<string, unknown> = {
    ...f,
    Title: { value: p.model },
    NavigationTitle: { value: p.model },
    Subtitle: { value: subtitle },
    Summary: { value: p.summary ? `<p>${esc(p.summary)}</p>` : '' },
    Price: { value: priceOf(p) },
    Specs: { value: specsTable(p) },
    Image1: image(p.hero_image_url, `Bobcat ${p.model} ${subtitle}`.trim()) ?? f.Image1,
    Image2: image(gallery[0], `Bobcat ${p.model}`) ?? f.Image2,
    Image3: image(gallery[1], `Bobcat ${p.model}`) ?? f.Image3,
    Image4: image(gallery[2], `Bobcat ${p.model}`) ?? f.Image4,
    baseOgTitle: { value: `${p.name} | Bobcat Company` },
    baseOgDescription: { value: p.summary ?? '' },
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
  if (product.product_kind !== 'attachment') return mergeProduct(page, product);

  // An attachment: the machines it fits ("Works with") and every machine (the "Fits my machine?" check), from the PIM
  const toOption = (m: { sku: string; slug: string; model: string; name: string; status: MachineOption['status']; category_path: string }): MachineOption => ({
    sku: m.sku, slug: m.slug, model: m.model, name: m.name, status: m.status, category_path: m.category_path,
  });
  // Secondary data: if the PIM cannot answer (rate limit, outage), the page renders without these sections, never a 500
  const [fits, machines] = await Promise.all([
    getCompatibleMachines(product.sku).catch(() => null),
    getMachines().catch(() => null),
  ]);
  if (!fits || !machines) return mergeProduct(page, product);
  return mergeProduct(page, product, {
    worksWith: { current: fits.current.map(toOption), previous: fits.previous.map(toOption) },
    machines: machines
      .filter((m) => m.status === 'active' || m.status === 'discontinued')
      .map(toOption)
      .sort((a, b) => Number(a.status !== 'active') - Number(b.status !== 'active')),
  });
};

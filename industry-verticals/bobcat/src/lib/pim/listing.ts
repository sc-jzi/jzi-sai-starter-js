import { Page } from '@sitecore-content-sdk/nextjs';
import { getCategories, getCategoryProducts, getMachines } from './client';
import { CategoryListing, ListingProduct, MachineOption } from './product-context';

/**
 * Category pages (catalog plan section 4, "Category pages"): a page whose path is a PIM category's sitecore_path and
 * that holds a ModelListing gets the category's PIM products on `layout.sitecore.context.pimListing`. ModelListing shows
 * them beside its authored model cards (no duplicates, by model) and puts discontinued ones under "Previous models".
 * Pages without a ModelListing make no PIM call.
 */

type Rendering = { componentName?: string; placeholders?: Record<string, Rendering[]> };

const hasComponent = (placeholders: Record<string, Rendering[]> | undefined, name: string): boolean =>
  Object.values(placeholders ?? {}).some((list) =>
    (list ?? []).some((r) => r?.componentName === name || hasComponent(r?.placeholders, name))
  );

export const attachCategoryListing = async (page: Page | null, path: string[] | undefined): Promise<Page | null> => {
  // Secondary data: without an answer from the PIM the category page shows its authored cards only, never a 500
  try {
    return await withCategoryListing(page, path);
  } catch {
    return page;
  }
};

const withCategoryListing = async (page: Page | null, path: string[] | undefined): Promise<Page | null> => {
  const route = page?.layout?.sitecore?.route;
  if (!page || !route || !hasComponent(route.placeholders as Record<string, Rendering[]>, 'ModelListing')) return page;
  const sitePath = `/${(path ?? []).map((s) => decodeURIComponent(s).toLowerCase()).join('/')}`;
  const categories = await getCategories();
  const category = categories.find((c) => c.sitecore_path?.toLowerCase() === sitePath);
  if (!category) return page;
  // The top-level category it belongs to (an empty subcategory still knows it lists attachments)
  let root = category;
  for (let i = 0; i < 5 && root.parent_id; i++) root = categories.find((c) => c.id === root.parent_id) ?? root;

  const products: ListingProduct[] = (await getCategoryProducts(category.slug))
    .filter((p) => p.status === 'active' || p.status === 'discontinued')
    .map((p) => ({
      sku: p.sku,
      slug: p.slug,
      model: p.model,
      name: p.name,
      status: p.status,
      data_origin: p.data_origin,
      summary: p.summary || null,
      msrp: p.msrp || null,
      hero_image_url: p.hero_image_url || null,
      category_path: p.category_path,
      model_years: p.model_years || null,
      key_specs: p.key_specs ?? {},
      product_kind: p.product_kind,
      carrier_types: p.carrier_types ?? [],
      fits: p.fits ?? [],
    }));
  // A category of attachments: the "Fits my machine" picker lists the machines any of them fits (current first)
  const kind =
    root.slug === 'attachments' || (products.length > 0 && products.every((p) => p.product_kind === 'attachment'))
      ? 'attachment'
      : 'machine';
  let machines: MachineOption[] = [];
  if (kind === 'attachment') {
    const fitting = new Set(products.flatMap((p) => p.fits));
    machines = (await getMachines())
      .filter((m) => fitting.has(m.sku))
      .map((m) => ({ sku: m.sku, slug: m.slug, model: m.model, name: m.name, status: m.status, category_path: m.category_path }))
      .sort((a, b) => Number(a.status !== 'active') - Number(b.status !== 'active'));
  }
  const pimListing: CategoryListing = {
    category: { name: category.name, slug: category.slug, sitecore_path: category.sitecore_path },
    products,
    kind,
    machines,
  };
  return {
    ...page,
    layout: {
      ...page.layout,
      sitecore: {
        ...page.layout.sitecore,
        context: { ...page.layout.sitecore.context, pimListing } as typeof page.layout.sitecore.context,
      },
    },
  };
};

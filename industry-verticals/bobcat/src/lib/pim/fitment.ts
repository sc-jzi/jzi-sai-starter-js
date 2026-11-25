import { Page } from '@sitecore-content-sdk/nextjs';
import { getCompatibleAttachments, getProductBySlug } from './client';
import { getEnrichment } from './enrichment';
import { MachineFitment, productOf } from './product-context';

/**
 * Machine pages (catalog plan section 4b, "Compatible attachments"): on any page of the Product template that shows a PIM
 * machine - a wildcard page merged with its product, or an authored machine page such as E35 whose slug is a PIM product
 * of that category - the attachments that fit it (PIM fitment, current attachments, grouped by subcategory) go on
 * `layout.sitecore.context.pimFitment`. ProductDetails BobcatAttachments renders them. What fits is PIM data; nobody
 * keeps a compatibility list in the CMS. Attachment and concept pages get nothing.
 */
const PRODUCT_TEMPLATE = 'Product';

export const attachMachineFitment = async (page: Page | null, path: string[] | undefined): Promise<Page | null> => {
  const route = page?.layout?.sitecore?.route;
  if (!page || !route || route.templateName !== PRODUCT_TEMPLATE) return page;

  let machine = productOf(page);
  if (!machine) {
    // an authored product page: its item name is the PIM slug within its category (D2)
    const segments = (path ?? []).map((s) => decodeURIComponent(s).toLowerCase());
    const slug = segments[segments.length - 1];
    const categorySlug = segments[segments.length - 2];
    if (!slug || !categorySlug) return page;
    const p = await getProductBySlug(categorySlug, slug).catch(() => null);
    if (!p) return page;
    machine = { ...p, model_years: p.model_years ?? null, discontinued_on: p.discontinued_on ?? null, successor: null };
  }
  if (machine.product_kind !== 'machine') return page;

  // Secondary data: without an answer from the PIM the page renders without the row, never a 500
  const [res, enrichment] = await Promise.all([
    getCompatibleAttachments(machine.sku).catch(() => null),
    machine.category ? getEnrichment(machine.category.slug, machine.sku).catch(() => null) : null,
  ]);
  if (!res) return page;
  // Marketing's Featured Attachments (enrichment) come first, but only ones that fit: what fits stays PIM data
  const featured = enrichment?.featuredAttachments ?? [];
  const rank = (sku: string) => (featured.includes(sku) ? featured.indexOf(sku) : featured.length);
  const groups = [...res.groups]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((g) => ({
      slug: g.slug,
      name: g.name,
      items: g.items.map((i) => ({
        sku: i.sku,
        slug: i.slug,
        model: i.model,
        name: i.name,
        hero_image_url: i.hero_image_url || null,
        category_path: i.category_path,
        hydraulics_required: i.hydraulics_required || null,
        featured: featured.includes(i.sku),
      })).sort((a, b) => rank(a.sku) - rank(b.sku)),
    }))
    .filter((g) => g.items.length);
  if (!groups.length) return page;

  // the Featured tab: marketing's picks in their order, only those that fit (a pick that no longer fits drops out)
  const all = groups.flatMap((g) => g.items);
  const featuredCards = featured.map((sku) => all.find((i) => i.sku === sku)).filter((i): i is (typeof all)[number] => !!i);
  const pimFitment: MachineFitment = {
    machine: { sku: machine.sku, model: machine.model },
    groups,
    featured: featuredCards,
  };
  return {
    ...page,
    layout: {
      ...page.layout,
      sitecore: {
        ...page.layout.sitecore,
        context: { ...page.layout.sitecore.context, pimFitment } as typeof page.layout.sitecore.context,
      },
    },
  };
};

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

/**
 * The PIM adapter: the only file that knows the PIM's API. For the demo the PIM is Xano (standing in for Product Data
 * Digger); swapping in PDD means changing this file, not its callers.
 *
 * Every read is cached for a day and tagged ('pim', 'pim:cat:<category slug>', 'pim:slug:<category slug>/<slug>'), so the PIM is hit at most
 * once per product per day. POST /api/pim/revalidate expires a tag to show a change at once. unstable_cache is used
 * (not fetch's own cache) because the page route forces fetches to no-store.
 */

export const PIM_API_URL = (
  process.env.PIM_API_URL || 'https://x8ki-letl-twmt.n7.xano.io/api:product-pim'
).replace(/\/$/, '');
export const PIM_REVALIDATE_SECONDS = 86400;

export type PimStatus = 'active' | 'discontinued' | 'draft';

export interface PimSpec {
  group: string;
  label: string;
  value: string;
  unit?: string | null;
  facet_key?: string | null;
  sort?: number;
}

export interface PimCategoryRef {
  name: string;
  slug: string;
  sitecore_path: string;
}

export interface PimProductRef {
  sku: string;
  slug: string;
  model: string;
  name: string;
  hero_image_url?: string | null;
  category_path: string;
}

export interface PimProduct extends PimProductRef {
  product_kind: 'machine' | 'attachment';
  status: PimStatus;
  data_origin: 'real' | 'illustrative';
  summary?: string | null;
  msrp?: number | null;
  gallery_urls?: string[] | null;
  model_years?: string | null;
  discontinued_on?: string | null;
  successor_sku?: string | null;
  updated_at?: number;
  specs: PimSpec[];
  category: PimCategoryRef | null;
  successor?: PimProductRef | null;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * One PIM read. The Xano free plan allows 10 requests per 20 s, so a 429 waits (Retry-After, else 2 s, 4 s) and retries
 * up to twice; the day-long cache keeps that rare once pages are warm.
 */
const get = async <T>(path: string): Promise<T | null> => {
  let res: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(`${PIM_API_URL}/${path}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (res.status !== 429 || attempt === 2) break;
    const after = Number(res.headers.get('retry-after'));
    await wait(Number.isFinite(after) && after > 0 ? Math.min(after, 10) * 1000 : 2000 * (attempt + 1));
  }
  if (!res) throw new Error(`PIM ${path}: no response`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`PIM ${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
};

/**
 * The product with this slug in this leaf category, or null (unknown slug, another category, or a draft).
 * A PIM outage throws, so the page errors instead of caching a false 404. React's cache() makes the page and its
 * metadata share one read per request.
 */
export const getProductBySlug = cache((categorySlug: string, slug: string): Promise<PimProduct | null> =>
  unstable_cache(
    () => get<PimProduct>(`products/by-slug/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slug)}`),
    ['pim', 'by-slug', categorySlug, slug],
    { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', `pim:cat:${categorySlug}`, slugTag(categorySlug, slug)] }
  )()
);

/** The cache tag of one product page; the revalidate endpoint finds a SKU's category and slug through getProductBySku. */
export const slugTag = (categorySlug: string, slug: string) => `pim:slug:${categorySlug}/${slug}`;

/** A product by SKU, uncached (used by the revalidate endpoint to find which page tag to expire). */
export const getProductBySku = (sku: string) => get<PimProduct>(`products/${encodeURIComponent(sku)}`);

export interface PimCategory extends PimCategoryRef {
  id: number;
  parent_id?: number | null;
  sort?: number;
  product_count?: number;
}

/** A product as a category listing returns it: no spec rows, but its facet specs as key_specs ({facet_key: value}). */
export interface PimListedProduct extends PimProductRef {
  status: PimStatus;
  data_origin: 'real' | 'illustrative';
  product_kind: 'machine' | 'attachment';
  summary?: string | null;
  msrp?: number | null;
  model_years?: string | null;
  successor_sku?: string | null;
  key_specs?: Record<string, string>;
  /** attachments: the machine types bobcat.com lists it for */
  carrier_types?: string[] | null;
  /** attachments: the machine SKUs it fits (PIM fitment pairs) */
  fits?: string[] | null;
}

/** A machine an attachment fits, as compatible-machines returns it. */
export interface PimMachineRef extends PimProductRef {
  status: PimStatus;
}

/** The category tree (flat), cached a day. */
export const getCategories = cache(() =>
  unstable_cache(async () => (await get<PimCategory[]>('categories')) ?? [], ['pim', 'categories'], {
    revalidate: PIM_REVALIDATE_SECONDS,
    tags: ['pim', 'pim:categories'],
  })()
);

/** Every current and previous machine (all categories), cached a day: the "Fits my machine" pickers list them. */
export const getMachines = cache(() =>
  unstable_cache(
    async () => {
      const all: PimListedProduct[] = [];
      for (let page = 1; page <= 20; page++) {
        const res = await get<{ items: PimListedProduct[]; total: number }>(
          `products?kind=machine&status=all&facets=false&per_page=100&page=${page}`
        );
        if (!res) break;
        all.push(...res.items);
        if (all.length >= res.total || !res.items.length) break;
      }
      return all;
    },
    ['pim', 'machines'],
    { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', 'pim:machines'] }
  )()
);

/** The machines an attachment fits, current and previous (PIM fitment), cached a day. */
export const getCompatibleMachines = cache((sku: string) =>
  unstable_cache(
    async () =>
      (await get<{ current: PimMachineRef[]; previous: PimMachineRef[] }>(
        `products/${encodeURIComponent(sku)}/compatible-machines`
      )) ?? { current: [], previous: [] },
    ['pim', 'compatible-machines', sku],
    { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', `pim:fitment:${sku.toUpperCase()}`] }
  )()
);

/** Every current and previous product of a category (and its subcategories), in the PIM's natural model order. */
export const getCategoryProducts = cache((categorySlug: string) =>
  unstable_cache(
    async () => {
      const all: PimListedProduct[] = [];
      for (let page = 1; page <= 20; page++) {
        const res = await get<{ items: PimListedProduct[]; total: number }>(
          `products?category=${encodeURIComponent(categorySlug)}&status=all&facets=false&per_page=100&page=${page}`
        );
        if (!res) break;
        all.push(...res.items);
        if (all.length >= res.total || !res.items.length) break;
      }
      return all;
    },
    ['pim', 'category-products', categorySlug],
    { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', `pim:cat:${categorySlug}`] }
  )()
);

/** One subcategory of attachments that fit a machine, as compatible-attachments returns it. */
export interface PimAttachmentGroup {
  slug: string;
  name: string;
  sort?: number;
  items: (PimProductRef & { hydraulics_required?: string | null })[];
}

/** The current attachments that fit a machine, grouped by attachment subcategory (PIM fitment), cached a day. */
export const getCompatibleAttachments = cache((sku: string) =>
  unstable_cache(
    async () =>
      (await get<{ machine_sku: string; groups: PimAttachmentGroup[] }>(
        `products/${encodeURIComponent(sku)}/compatible-attachments`
      )) ?? { machine_sku: sku, groups: [] },
    ['pim', 'compatible-attachments', sku],
    { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', `pim:fitment:${sku.toUpperCase()}`] }
  )()
);

/** One product URL source, as sitemap/products returns it (drafts are never in it). */
export interface PimSitemapEntry {
  sku: string;
  slug: string;
  category_path: string;
  status: PimStatus;
  updated_at?: number | null;
}

/** Every listable product with its category path and last change, cached a day (the product sitemaps). */
export const getProductSitemapEntries = cache(() =>
  unstable_cache(async () => (await get<PimSitemapEntry[]>('sitemap/products')) ?? [], ['pim', 'sitemap'], {
    revalidate: PIM_REVALIDATE_SECONDS,
    tags: ['pim', 'pim:sitemap'],
  })()
);

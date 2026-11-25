'use client';

/** Browser-side PIM reads, through the app's own /api/pim proxy (src/app/api/pim). */
export interface PimCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  sitecore_path: string;
  sort?: number;
  product_count?: number;
}
export interface PimListed {
  sku: string;
  slug: string;
  model: string;
  name: string;
  status: 'active' | 'discontinued' | 'draft';
  data_origin: 'real' | 'illustrative';
  product_kind: 'machine' | 'attachment';
  category_path: string;
  hero_image_url?: string | null;
  summary?: string | null;
  msrp?: number | null;
  model_years?: string | null;
  key_specs?: Record<string, string>;
}
export interface PimSpec { group: string; label: string; value: string; unit?: string | null; sort?: number }
export interface PimProduct extends PimListed {
  specs: PimSpec[];
  gallery_urls?: string[] | null;
  successor_sku?: string | null;
  successor?: { sku: string; model: string; name: string } | null;
  category: { name: string; slug: string; sitecore_path: string } | null;
  updated_at?: number;
}
export interface AttachmentGroup { slug: string; name: string; items: { sku: string; model: string; name: string; hero_image_url?: string | null }[] }

const get = async <T,>(path: string): Promise<T> => {
  const res = await fetch(`/api/pim/${path}`);
  if (!res.ok) throw new Error(`PIM ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
};

export const pim = {
  categories: () => get<PimCategory[]>('categories'),
  listing: async (category: string) => {
    const all: PimListed[] = [];
    for (let page = 1; page <= 20; page++) {
      const r = await get<{ items: PimListed[]; total: number }>(
        `products?category=${encodeURIComponent(category)}&status=all&facets=false&per_page=100&page=${page}`
      );
      all.push(...r.items);
      if (all.length >= r.total || !r.items.length) break;
    }
    return all;
  },
  search: (q: string) =>
    get<{ items: PimListed[]; total: number }>(`products?q=${encodeURIComponent(q)}&status=all&facets=false&per_page=50`),
  product: (sku: string, fresh = false) => get<PimProduct>(`products/${encodeURIComponent(sku)}${fresh ? '?fresh=1' : ''}`),
  compatibleAttachments: (sku: string) =>
    get<{ groups: AttachmentGroup[] }>(`products/${encodeURIComponent(sku)}/compatible-attachments`),
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010').replace(/\/$/, '');
export const productUrl = (p: { category_path: string; slug: string }) =>
  `${SITE_URL}${p.category_path.replace(/\/?$/, '/')}${p.slug}`;

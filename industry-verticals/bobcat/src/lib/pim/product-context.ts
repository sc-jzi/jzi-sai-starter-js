import { Page } from '@sitecore-content-sdk/nextjs';

/**
 * The PIM product a wildcard product page carries on `layout.sitecore.context.product` (set by product-page.ts).
 * Client-safe: no server imports, so 'use client' components can read it too.
 */
export interface ProductRef {
  sku: string;
  slug: string;
  model: string;
  name: string;
  category_path: string;
  hero_image_url?: string | null;
}

export interface ProductContext {
  sku: string;
  slug: string;
  model: string;
  name: string;
  status: 'active' | 'discontinued' | 'draft';
  data_origin: 'real' | 'illustrative';
  product_kind: 'machine' | 'attachment';
  model_years: string | null;
  discontinued_on: string | null;
  successor: ProductRef | null;
  category: { name: string; slug: string; sitecore_path: string } | null;
  /** attachments: the machines it fits (PIM fitment), current and previous */
  worksWith?: { current: MachineOption[]; previous: MachineOption[] } | null;
  /** attachments: every machine, for the "Fits my machine?" check */
  machines?: MachineOption[] | null;
  /** marketing's enrichment shown on the page (Product Enrichment app); null when the product is not enriched */
  enrichment?: { marketingTitle: string; badge: string; metaTitle: string; metaDescription: string; noindex: boolean } | null;
  /** set when enrichment says "Redirect to successor": the route answers with a permanent redirect to this path */
  redirectTo?: string | null;
}

/** A machine in a "Works with" list or a "Fits my machine" picker. */
export interface MachineOption {
  sku: string;
  slug: string;
  model: string;
  name: string;
  status: 'active' | 'discontinued' | 'draft';
  category_path: string;
}

/** Readable names of the PIM carrier types (machine types an attachment is listed for). */
export const CARRIER_LABELS: Record<string, string> = {
  compact_excavator: 'Compact Excavators',
  large_excavator: 'Large Excavators',
  compact_track_loader: 'Compact Track Loaders',
  skid_steer_loader: 'Skid-Steer Loaders',
  utility_tractor: 'Utility Tractors',
  compact_tractor: 'Compact Tractors',
};
export const carrierLabel = (t: string) =>
  CARRIER_LABELS[t] ?? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** The product on a page, when it is a PIM product page; null on authored pages. */
export const productOf = (page: Page | null | undefined): ProductContext | null =>
  (page?.layout?.sitecore?.context as { product?: ProductContext } | undefined)?.product ?? null;

/** Site path of a PIM product ("/equipment/excavators/compact-excavators/e32"). */
export const productPath = (p: Pick<ProductRef, 'category_path' | 'slug'>): string =>
  `${p.category_path.replace(/\/?$/, '/')}${p.slug}`;

/** A product card a category listing shows (from the PIM; see listing.ts). */
export interface ListingProduct {
  sku: string;
  slug: string;
  model: string;
  name: string;
  status: 'active' | 'discontinued' | 'draft';
  data_origin: 'real' | 'illustrative';
  summary: string | null;
  msrp: number | null;
  hero_image_url: string | null;
  category_path: string;
  model_years: string | null;
  key_specs: Record<string, string>;
  product_kind: 'machine' | 'attachment';
  carrier_types: string[];
  fits: string[];
}

/** The PIM products of a category page, on `layout.sitecore.context.pimListing` (only on pages with a ModelListing). */
export interface CategoryListing {
  category: { name: string; slug: string; sitecore_path: string };
  products: ListingProduct[];
  /** 'attachment' when the category holds attachments: the listing shows Works With and Fits my machine */
  kind: 'machine' | 'attachment';
  /** attachment listings: the machines the "Fits my machine" picker offers (those any listed attachment fits) */
  machines: MachineOption[];
}

export const listingOf = (page: Page | null | undefined): CategoryListing | null =>
  (page?.layout?.sitecore?.context as { pimListing?: CategoryListing } | undefined)?.pimListing ?? null;

/** Units of the PIM facet values (the snapshot parsers' units), so a listing can convert to the unit it shows. */
export const FACET_UNITS: Record<string, string> = {
  horsepower: 'hp',
  pto_horsepower: 'hp',
  operating_weight: 'lbs',
  dig_depth: 'ft',
  lift_capacity: 'lbs',
  rated_operating_capacity: 'lbs',
};

/** An attachment card in a machine page's Compatible attachments row. */
export interface AttachmentCard {
  sku: string;
  slug: string;
  model: string;
  name: string;
  hero_image_url: string | null;
  category_path: string;
  hydraulics_required: string | null;
  /** marketing featured it for this machine (enrichment Featured Attachments) */
  featured?: boolean;
}

/**
 * The attachments that fit the machine a page shows (wildcard or authored machine page), grouped by subcategory, on
 * `layout.sitecore.context.pimFitment` (src/lib/pim/fitment.ts). Separate from `product` so authored pages keep their own
 * behaviour (Save to My Machine, authored price) and only gain the row.
 */
export interface MachineFitment {
  machine: { sku: string; model: string };
  groups: { slug: string; name: string; items: AttachmentCard[] }[];
  /** marketing's Featured Attachments (enrichment) that fit, in marketing's order; empty when none are featured */
  featured: AttachmentCard[];
}

export const fitmentOf = (page: Page | null | undefined): MachineFitment | null =>
  (page?.layout?.sitecore?.context as { pimFitment?: MachineFitment } | undefined)?.pimFitment ?? null;

/**
 * What the analytics events (CdpPageView: the page view and PRODUCT_VIEW) say about the product on a page, set server-side on
 * `layout.sitecore.context.productAnalytics` (pim/analytics.ts) for PIM wildcard pages and authored product pages alike.
 * Flat values only: CDP stores them as the event's `ext` attributes (at most 50).
 */
export interface ProductAnalytics {
  sku: string;
  model: string;
  product_name: string;
  category: string;
  category_name: string;
  product_kind: 'machine' | 'attachment';
  status: 'active' | 'discontinued' | 'draft';
  /** the page is a Sitecore item (authored) or the category wildcard filled from the PIM */
  source: 'pim' | 'authored';
  data_origin: 'real' | 'illustrative';
  successor_sku?: string;
  /** PIM MSRP, illustrative (D4) */
  price?: number;
  enriched: boolean;
  badge?: string;
  has_offer: boolean;
}

export const productAnalyticsOf = (page: Page | null | undefined): ProductAnalytics | null =>
  (page?.layout?.sitecore?.context as { productAnalytics?: ProductAnalytics } | undefined)?.productAnalytics ?? null;

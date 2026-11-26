'use client';

import type { ClientSDK } from '@sitecore-marketplace-sdk/client';
import { authoring } from './marketplace';

/**
 * Product enrichment items in SitecoreAI (catalog plan section 7): `Data/Product Enrichment/<category slug>/<SKU>`,
 * template "Product Enrichment". An item exists only once a product is enriched: the first Save creates it.
 * Field types (R26): Single-Line / Multi-Line Text, Rich Text, General Link (link XML, R7), Image, Checkbox, Droplist.
 */
export const ENRICHMENT_ROOT = '/sitecore/content/Bobcat/bobcat/Data/Product Enrichment';
export const ENRICHMENT_TEMPLATE_ID = '{F040669A-1589-4950-BCFA-3B9CF17B93BF}';

/** The one offer page an enrichment can link to today (the site's Special Offers page), as internal link XML (R7). */
export const OFFER_PAGES = [
  { id: '{19CC9131-35A2-4B43-86D3-CB9C2A1F5DB5}', label: 'Special Offers', text: 'View Offers' },
];

export interface EnrichmentValues {
  marketingTitle: string;
  summaryOverride: string;
  highlights: string;
  badge: string;
  offerPageId: string;
  metaTitle: string;
  metaDescription: string;
  /** Cloudinary asset URL (picked in the Cloudinary Media Library widget), stored as an external General Link. */
  ogImageUrl: string;
  aeoShortAnswer: string;
  noindex: boolean;
  discontinuedHandling: '' | 'Keep page' | 'Redirect to successor' | 'Hide';
  featuredAttachments: string[];
}

export interface EnrichmentItem {
  itemId: string;
  sku: string;
  category: string;
  updated: string | null;
  updatedBy: string | null;
  workflowState: string | null;
  values: EnrichmentValues;
}

export const EMPTY_VALUES: EnrichmentValues = {
  marketingTitle: '',
  summaryOverride: '',
  highlights: '',
  badge: '',
  offerPageId: '',
  metaTitle: '',
  metaDescription: '',
  ogImageUrl: '',
  aeoShortAnswer: '',
  noindex: false,
  discontinuedHandling: '',
  featuredAttachments: [],
};

type Field = { name: string; value: string };
type Node = {
  itemId: string;
  name: string;
  fields: { nodes: Field[] };
  updated?: { value?: string } | null;
  updatedBy?: { value?: string } | null;
  workflow?: { workflowState?: { displayName?: string } | null } | null;
};

/**
 * "sitecore\jane@acme.com" -> "jane@acme.com". Built-in authorization records the app's own client identity (a bare
 * client ID), shown as "the Product Enrichment app".
 */
const whoOf = (v: string): string | null => {
  const who = v.replace(/^sitecore\\/i, '');
  if (!who) return null;
  return /^[A-Za-z0-9]{24,}$/.test(who) ? 'the Product Enrichment app' : who;
};

const toItem = (category: string, n: Node): EnrichmentItem => {
  const f = Object.fromEntries(n.fields.nodes.map((x) => [x.name, x.value ?? '']));
  const offerId = (f['Offer Link'] || '').match(/id="(\{[^"]+\})"/i)?.[1]?.toUpperCase() ?? '';
  const ogUrl = (f['OG Image URL'] || '').match(/url="([^"]+)"/i)?.[1]?.replace(/&amp;/g, '&') ?? '';
  return {
    itemId: n.itemId,
    sku: (f['SKU'] || n.name).toUpperCase(),
    category,
    updated: n.updated?.value || null,
    updatedBy: whoOf(n.updatedBy?.value || ''),
    workflowState: n.workflow?.workflowState?.displayName || null,
    values: {
      marketingTitle: f['Marketing Title'] || '',
      summaryOverride: f['Summary Override'] || '',
      highlights: f['Highlights'] || '',
      badge: f['Badge'] || '',
      offerPageId: offerId,
      metaTitle: f['Meta Title'] || '',
      metaDescription: f['Meta Description'] || '',
      ogImageUrl: ogUrl,
      aeoShortAnswer: f['AEO Short Answer'] || '',
      noindex: f['Noindex'] === '1',
      discontinuedHandling: (f['Discontinued Handling'] || '') as EnrichmentValues['discontinuedHandling'],
      featuredAttachments: (f['Featured Attachments'] || '').split(/\r?\n/).map((s) => s.trim().toUpperCase()).filter(Boolean),
    },
  };
};

// own fields by list; the standard fields the app shows (last edited, by whom, workflow state) by name
const fieldsSelection = `fields(ownFields: true) { nodes { name value } }
  updated: field(name: "__Updated") { value } updatedBy: field(name: "__Updated by") { value }
  workflow { workflowState { displayName } }`;

/** Every enrichment item, by category folder: { folders: {slug -> folder id}, items: {SKU -> item} }. */
export async function listEnrichment(client: ClientSDK, contextId: string) {
  const data = await authoring<{
    item: { children: { nodes: { itemId: string; name: string; children: { nodes: Node[] } }[] } } | null;
  }>(
    client,
    contextId,
    `query($path: String!) { item(where: { path: $path, language: "en" }) { children(first: 100) { nodes { itemId name
      children(first: 1000) { nodes { itemId name ${fieldsSelection} } } } } } }`,
    { path: ENRICHMENT_ROOT }
  );
  const folders: Record<string, string> = {};
  const items: Record<string, EnrichmentItem> = {};
  for (const folder of data.item?.children.nodes ?? []) {
    folders[folder.name] = folder.itemId;
    for (const n of folder.children.nodes) {
      const it = toItem(folder.name, n);
      items[it.sku] = it;
    }
  }
  return { folders, items };
}

const xmlAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
/** An external General Link (R7): the asset URL itself, no text. */
const externalLinkXml = (url: string) => (url.trim() ? `<link linktype="external" url="${xmlAttr(url.trim())}" />` : '');

const linkXml = (pageId: string) => {
  const page = OFFER_PAGES.find((p) => p.id === pageId);
  return page ? `<link text="${page.text}" linktype="internal" id="${page.id}" />` : '';
};

const toFields = (sku: string, v: EnrichmentValues): Field[] => [
  { name: 'SKU', value: sku },
  { name: 'Marketing Title', value: v.marketingTitle.trim() },
  { name: 'Summary Override', value: v.summaryOverride.trim() },
  { name: 'Highlights', value: v.highlights.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join('\n') },
  { name: 'Badge', value: v.badge.trim() },
  { name: 'Offer Link', value: linkXml(v.offerPageId) },
  { name: 'Meta Title', value: v.metaTitle.trim() },
  { name: 'Meta Description', value: v.metaDescription.trim() },
  { name: 'OG Image URL', value: externalLinkXml(v.ogImageUrl) },
  { name: 'AEO Short Answer', value: v.aeoShortAnswer.trim() },
  { name: 'Noindex', value: v.noindex ? '1' : '' },
  { name: 'Discontinued Handling', value: v.discontinuedHandling },
  { name: 'Featured Attachments', value: v.featuredAttachments.join('\n') },
];

/** Save: creates the item on the first save (in the category's folder), then updates it. Returns the item read back. */
export async function saveEnrichment(
  client: ClientSDK,
  contextId: string,
  args: { sku: string; category: string; folderId: string | undefined; itemId?: string; values: EnrichmentValues }
): Promise<EnrichmentItem> {
  const fields = toFields(args.sku, args.values);
  let itemId = args.itemId;
  if (!itemId) {
    if (!args.folderId) throw new Error(`No enrichment folder for category "${args.category}" in SitecoreAI.`);
    const created = await authoring<{ createItem: { item: { itemId: string } } }>(
      client,
      contextId,
      `mutation($input: CreateItemInput!) { createItem(input: $input) { item { itemId } } }`,
      { input: { name: args.sku, templateId: ENRICHMENT_TEMPLATE_ID, parent: args.folderId, language: 'en', fields } }
    );
    itemId = created.createItem.item.itemId;
  } else {
    await authoring(
      client,
      contextId,
      `mutation($input: UpdateItemInput!) { updateItem(input: $input) { item { itemId } } }`,
      { input: { itemId, language: 'en', fields } }
    );
  }
  // read back (R23): what SitecoreAI stored is what the app shows
  const back = await authoring<{ item: Node | null }>(
    client,
    contextId,
    `query($id: ID!) { item(where: { itemId: $id, language: "en" }) { itemId name ${fieldsSelection} } }`,
    { id: itemId }
  );
  if (!back.item) throw new Error('Saved, but the item could not be read back.');
  return toItem(args.category, back.item);
}

/** Publish the enrichment item to Experience Edge (the live site). Not used while building on localhost (R11). */
export async function publishEnrichment(client: ClientSDK, contextId: string, itemId: string) {
  return authoring<{ publishItem: { operationId: string } }>(
    client,
    contextId,
    `mutation($input: PublishItemInput!) { publishItem(input: $input) { operationId } }`,
    {
      input: {
        rootItemId: itemId,
        languages: ['en'],
        targetDatabases: ['experienceedge'],
        publishItemMode: 'SMART',
        publishSubItems: true,
        publishRelatedItems: false,
      },
    }
  );
}


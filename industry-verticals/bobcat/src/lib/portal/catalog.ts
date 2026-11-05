/**
 * Product catalog lookup for the My Machine portal (server only): the saved machines are Product pages in Sitecore, so the
 * portal reads their name, category, summary, highlights, image and URL from Experience Edge by item id. This stands in
 * for the product catalog a real portal would call.
 */

export type CatalogProduct = {
  id: string;
  model: string;
  type: string;
  summary: string;
  highlights: string[];
  image: string;
  imageAlt: string;
  path: string;
};

const itemQuery = (i: number) =>
  `p${i}: item(path: $id${i}, language: $language) { id url { path } title: field(name: "Title") { value } subtitle: field(name: "Subtitle") { value } summary: field(name: "Summary") { value } highlights: field(name: "Highlights") { value } image: field(name: "Image1") { jsonValue } }`;

const endpoint = (): string | null => {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!contextId) return null;
  const host = (process.env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME || 'https://edge-platform.sitecorecloud.io').replace(/\/$/, '');
  return `${host}/v1/content/api/graphql/v1?sitecoreContextId=${contextId}`;
};

const text = (html?: string): string =>
  `${html ?? ''}`.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const listItems = (html?: string): string[] =>
  [...`${html ?? ''}`.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => text(m[1])).filter(Boolean);

type EdgeItem = {
  id: string;
  url?: { path?: string };
  title?: { value?: string };
  subtitle?: { value?: string };
  summary?: { value?: string };
  highlights?: { value?: string };
  image?: { jsonValue?: { value?: { src?: string; alt?: string } } };
} | null;

/** The Product pages for these item ids, in the same order; ids that are not found are left out. */
export const getCatalogProducts = async (ids: string[]): Promise<CatalogProduct[]> => {
  const url = endpoint();
  if (!url || ids.length === 0) return [];
  const vars = ids.map((_, i) => `$id${i}: String!`).join(', ');
  const query = `query PortalProducts(${vars}, $language: String!) { ${ids.map((_, i) => itemQuery(i)).join(' ')} }`;
  const variables: Record<string, string> = { language: 'en' };
  ids.forEach((id, i) => (variables[`id${i}`] = id));
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });
    const json = (await res.json()) as { data?: Record<string, EdgeItem> };
    return ids
      .map((_, i) => json.data?.[`p${i}`])
      .filter((item): item is NonNullable<EdgeItem> => !!item)
      .map((item) => ({
        id: item.id,
        model: `${item.title?.value ?? ''}`,
        type: `${item.subtitle?.value ?? ''}`,
        summary: text(item.summary?.value),
        highlights: listItems(item.highlights?.value),
        image: item.image?.jsonValue?.value?.src ?? '',
        imageAlt: item.image?.jsonValue?.value?.alt ?? '',
        path: item.url?.path ?? '',
      }));
  } catch {
    return [];
  }
};

import { NextRequest, NextResponse } from 'next/server';

/**
 * Content search over this site's own article pages (no Sitecore Search index needed).
 *
 * Queries Experience Edge (preview context, so localhost sees master content) for Article Page
 * items under the site's Home, then filters / facets / sorts in memory.
 *
 * GET /api/content-search?q=dividend&type=Press%20Releases&topic=Dividends&year=2026&month=10&offset=0&limit=10
 *   - `type` and `topic` may repeat (OR within a facet, AND across facets).
 *
 * Response: { total, results: [{ id, title, url, date, excerpt, image, contentType, topics[] }],
 *             facets: { contentType: [{name,count}], topic: [{name,count}], year: [...], month: [...] } }
 *
 * GET /api/content-search?crumbs=<page item id>
 *   - the page's breadcrumb trail from the site's Home down to the page (pages with a layout only):
 *     { crumbs: [{ title, url }], siblings: [{ title, url }] }. Titles come from each item's NavigationTitle /
 *     Title / display name; `siblings` are the other pages under the page's parent (the press release sidebar links).
 */

export const dynamic = 'force-dynamic';

const SITE_ROOT = '/sitecore/content/TMX/tmx';
const HOME_PATH = `${SITE_ROOT}/Home`;
/** /sitecore/templates/Project/TMX/Pages/Article Page */
const ARTICLE_TEMPLATE_ID = 'FDC0417BE1174CD5A771AEA1FE06CD91';

const CONTENT_TYPES: { name: string; path: string }[] = [
  { name: 'Press Releases', path: `${HOME_PATH}/newsroom/press-releases/` },
  { name: 'POV', path: `${HOME_PATH}/pov/` },
];

const PAGE_SIZE = 50;
const MAX_PAGES = 10;

type FacetValue = { name: string; count: number };

export type ContentSearchResult = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  excerpt: string;
  image: { src: string; alt?: string; width?: string; height?: string } | null;
  contentType: string;
  topics: string[];
};

export type ContentSearchResponse = {
  total: number;
  results: ContentSearchResult[];
  facets: {
    contentType: FacetValue[];
    topic: FacetValue[];
    year: FacetValue[];
    month: FacetValue[];
  };
  error?: string;
};

type EdgeTag = {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: { Title?: { value?: string } };
};

type EdgeItem = {
  id: string;
  name: string;
  path: string;
  url?: { path?: string };
  title?: { value?: string } | null;
  excerpt?: { value?: string } | null;
  content?: { value?: string } | null;
  thumbnail?: { jsonValue?: { value?: Record<string, string> } } | null;
  tags?: { jsonValue?: EdgeTag[] } | null;
  pubDate?: { jsonValue?: { value?: string } | string | null } | null;
  created?: { value?: string } | null;
};

type Indexed = ContentSearchResult & { text: string; ts: number };

const HOME_QUERY = /* GraphQL */ `
  query ($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      id
    }
  }
`;

const SEARCH_QUERY = /* GraphQL */ `
  query ($home: String!, $template: String!, $language: String!, $first: Int!, $after: String) {
    search(
      where: {
        AND: [
          { name: "_path", value: $home, operator: CONTAINS }
          { name: "_templates", value: $template, operator: CONTAINS }
          { name: "_language", value: $language }
        ]
      }
      first: $first
      after: $after
    ) {
      total
      pageInfo {
        hasNext
        endCursor
      }
      results {
        id
        name
        path
        url {
          path
        }
        title: field(name: "Title") {
          value
        }
        excerpt: field(name: "Excerpt") {
          value
        }
        content: field(name: "Content") {
          value
        }
        thumbnail: field(name: "Thumbnail") {
          jsonValue
        }
        tags: field(name: "SxaTags") {
          jsonValue
        }
        pubDate: field(name: "PublicationDate") {
          jsonValue
        }
        created: field(name: "__Created") {
          value
        }
      }
    }
  }
`;

const CRUMBS_QUERY = /* GraphQL */ `
  fragment Crumb on Item {
    id
    name
    displayName
    path
    url {
      path
    }
    navTitle: field(name: "NavigationTitle") {
      value
    }
    title: field(name: "Title") {
      value
    }
  }
  query ($id: String!, $language: String!) {
    item(path: $id, language: $language) {
      ...Crumb
      ancestors(hasLayout: true) {
        ...Crumb
      }
    }
  }
`;

/** A separate query: crumbs + siblings in one request exceed Experience Edge's complexity limit. */
const SIBLINGS_QUERY = /* GraphQL */ `
  query ($id: String!, $language: String!) {
    item(path: $id, language: $language) {
      parent {
        children(hasLayout: true, first: 10) {
          results {
            id
            displayName
            path
            url {
              path
            }
            navTitle: field(name: "NavigationTitle") {
              value
            }
          }
        }
      }
    }
  }
`;

type CrumbItem = {
  id: string;
  name: string;
  displayName?: string;
  path: string;
  url?: { path?: string };
  navTitle?: { value?: string } | null;
  title?: { value?: string } | null;
};

export type ContentSearchCrumb = { title: string; url: string };

async function loadCrumbs(
  id: string,
  language: string
): Promise<{ crumbs: ContentSearchCrumb[]; siblings: ContentSearchCrumb[] }> {
  const endpoint = edgeEndpoint();
  if (!endpoint) throw new Error('Experience Edge context id is not configured');
  const [data, sib] = await Promise.all([
    edge<{ item: (CrumbItem & { ancestors?: CrumbItem[] }) | null }>(endpoint, CRUMBS_QUERY, {
      id,
      language,
    }),
    edge<{ item: { parent?: { children?: { results?: CrumbItem[] } } | null } | null }>(
      endpoint,
      SIBLINGS_QUERY,
      { id, language }
    ),
  ]);
  const item = data?.item;
  if (!item) return { crumbs: [], siblings: [] };
  const inSite = (i: CrumbItem) => (i.path || '').toLowerCase().startsWith(HOME_PATH.toLowerCase());
  const chain = [...(item.ancestors || [])]
    .filter(inSite)
    .sort((a, b) => a.path.length - b.path.length);
  const toCrumb = (i: CrumbItem, current: boolean): ContentSearchCrumb => ({
    // The current page is named by its title (as the page heading); ancestors by their navigation title.
    title: current
      ? i.title?.value || i.navTitle?.value || i.displayName || i.name
      : i.navTitle?.value || i.displayName || i.name,
    url: i.url?.path || '/',
  });
  const siblings = (sib?.item?.parent?.children?.results || [])
    .filter((i) => i.id !== item.id && inSite(i))
    .map((i) => toCrumb(i, false));
  return { crumbs: [...chain.map((i) => toCrumb(i, false)), toCrumb(item, true)], siblings };
}

function edgeEndpoint(): string | null {
  const contextId =
    process.env.SITECORE_EDGE_CONTEXT_ID || process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!contextId) return null;
  return `https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=${encodeURIComponent(contextId)}`;
}

async function edge<T>(endpoint: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Experience Edge responded ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data as T;
}

/** Sitecore stores dates as yyyyMMddTHHmmssZ; Edge may also hand back ISO strings. */
function toIso(raw?: string): string | null {
  if (!raw) return null;
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/.exec(raw);
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : new Date(raw);
  if (isNaN(d.getTime()) || d.getUTCFullYear() < 1900) return null;
  return d.toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max = 260): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : max)}…`;
}

function toIndexed(item: EdgeItem): Indexed | null {
  const path = item.path || '';
  const type = CONTENT_TYPES.find((t) => path.toLowerCase().startsWith(t.path.toLowerCase()));
  if (!type) return null;
  const title = item.title?.value || item.name;
  const body = stripHtml(item.content?.value || '');
  const excerpt = item.excerpt?.value || truncate(body);
  const pub = item.pubDate?.jsonValue;
  const date =
    toIso(typeof pub === 'string' ? pub : pub?.value) || toIso(item.created?.value);
  const img = item.thumbnail?.jsonValue?.value;
  const topics = (Array.isArray(item.tags?.jsonValue) ? item.tags.jsonValue : [])
    .map((t) => t?.fields?.Title?.value || t?.displayName || t?.name || '')
    .filter(Boolean);
  return {
    id: item.id,
    title,
    url: item.url?.path || '/',
    date,
    excerpt,
    image: img?.src ? { src: img.src, alt: img.alt, width: img.width, height: img.height } : null,
    contentType: type.name,
    topics,
    text: `${title} ${excerpt} ${body}`.toLowerCase(),
    ts: date ? Date.parse(date) : 0,
  };
}

async function loadAll(language: string): Promise<Indexed[]> {
  const endpoint = edgeEndpoint();
  if (!endpoint) throw new Error('Experience Edge context id is not configured');
  const home = await edge<{ item: { id: string } | null }>(endpoint, HOME_QUERY, {
    path: HOME_PATH,
    language,
  });
  if (!home?.item?.id) return [];

  const items: Indexed[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const data: {
      search: { pageInfo: { hasNext: boolean; endCursor: string }; results: EdgeItem[] };
    } = await edge(endpoint, SEARCH_QUERY, {
      home: home.item.id,
      template: ARTICLE_TEMPLATE_ID,
      language,
      first: PAGE_SIZE,
      after,
    });
    for (const r of data?.search?.results || []) {
      const indexed = toIndexed(r);
      if (indexed) items.push(indexed);
    }
    if (!data?.search?.pageInfo?.hasNext) break;
    after = data.search.pageInfo.endCursor;
  }
  return items;
}

function facet(items: Indexed[], pick: (i: Indexed) => string[]): FacetValue[] {
  const counts = new Map<string, number>();
  for (const i of items) for (const v of new Set(pick(i))) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

const yearOf = (i: Indexed) => (i.date ? [String(new Date(i.date).getUTCFullYear())] : []);
const monthOf = (i: Indexed) => (i.date ? [String(new Date(i.date).getUTCMonth() + 1)] : []);

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = (sp.get('q') || '').trim().toLowerCase();
  const types = sp.getAll('type').flatMap((t) => t.split(',')).map((t) => t.trim()).filter(Boolean);
  const topics = sp.getAll('topic').flatMap((t) => t.split(',')).map((t) => t.trim()).filter(Boolean);
  const year = (sp.get('year') || '').trim();
  const month = (sp.get('month') || '').trim();
  const offset = Math.max(0, parseInt(sp.get('offset') || '0', 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get('limit') || '10', 10) || 10));
  const language = sp.get('lang') || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

  const crumbsFor = (sp.get('crumbs') || '').trim();
  if (crumbsFor) {
    try {
      return NextResponse.json(await loadCrumbs(crumbsFor, language));
    } catch (e) {
      console.error('[content-search crumbs]', e instanceof Error ? e.message : e);
      return NextResponse.json({ crumbs: [], siblings: [] });
    }
  }

  const empty: ContentSearchResponse = {
    total: 0,
    results: [],
    facets: { contentType: [], topic: [], year: [], month: [] },
  };

  let all: Indexed[];
  try {
    all = await loadAll(language);
  } catch (e) {
    console.error('[content-search]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ...empty, error: 'Search is unavailable right now.' }, { status: 200 });
  }

  const terms = q.split(/\s+/).filter(Boolean);
  const lc = (s: string) => s.toLowerCase();
  const byQ = (i: Indexed) => terms.every((t) => i.text.includes(t));
  const byType = (i: Indexed) => !types.length || types.some((t) => lc(t) === lc(i.contentType));
  const byTopic = (i: Indexed) =>
    !topics.length || i.topics.some((it) => topics.some((t) => lc(t) === lc(it)));
  const byYear = (i: Indexed) => !year || yearOf(i)[0] === year;
  const byMonth = (i: Indexed) => !month || monthOf(i)[0] === String(parseInt(month, 10));

  const matches = all.filter((i) => byQ(i) && byType(i) && byTopic(i) && byYear(i) && byMonth(i));
  matches.sort((a, b) => b.ts - a.ts || a.title.localeCompare(b.title));

  // Each facet counts the results of every OTHER filter, so a visitor can widen within a facet.
  const facets = {
    contentType: facet(
      all.filter((i) => byQ(i) && byTopic(i) && byYear(i) && byMonth(i)),
      (i) => [i.contentType]
    ),
    topic: facet(
      all.filter((i) => byQ(i) && byType(i) && byYear(i) && byMonth(i)),
      (i) => i.topics
    ),
    year: facet(
      all.filter((i) => byQ(i) && byType(i) && byTopic(i)),
      yearOf
    ).sort((a, b) => Number(b.name) - Number(a.name)),
    month: facet(
      all.filter((i) => byQ(i) && byType(i) && byTopic(i) && byYear(i)),
      monthOf
    ).sort((a, b) => Number(a.name) - Number(b.name)),
  };

  const body: ContentSearchResponse = {
    total: matches.length,
    results: matches.slice(offset, offset + limit).map((i) => ({
      id: i.id,
      title: i.title,
      url: i.url,
      date: i.date,
      excerpt: i.excerpt,
      image: i.image,
      contentType: i.contentType,
      topics: i.topics,
    })),
    facets,
  };
  return NextResponse.json(body);
}

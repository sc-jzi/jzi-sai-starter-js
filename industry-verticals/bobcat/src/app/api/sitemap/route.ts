import { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createSitemapRouteHandler } from '@sitecore-content-sdk/nextjs/route-handler';
import { SiteResolver } from '@sitecore-content-sdk/content/site';
import sites from '.sitecore/sites.json';
import client from 'lib/sitecore-client';
import { getCategories, getProductSitemapEntries, PIM_REVALIDATE_SECONDS } from 'lib/pim/client';

/**
 * sitemap.xml (catalog plan section 5). Next rewrites /sitemap*.xml here.
 *  - /sitemap.xml: a sitemap index of the Sitecore sitemap(s) and one product sitemap per PIM category.
 *  - /sitemap-pages.xml: the Sitecore-generated sitemap (managed in SitecoreAI), minus any wildcard (`*`) item URL.
 *  - /sitemap-products-<category>.xml: the category's PIM products, only URLs the product route serves: active or
 *    discontinued (drafts are never listed), the category has a `*` item in Sitecore, and the slug is not an authored page
 *    (authored pages are in the Sitecore sitemap already). lastmod is the PIM's updated_at.
 *  - /sitemap-<n>.xml: the SDK's own handling, unchanged.
 * Product sitemaps are listed for the site that holds the catalog (the default site) only.
 */
export const dynamic = 'force-dynamic';

const sitecore = createSitemapRouteHandler({ client, sites });
const siteResolver = new SiteResolver(sites);
const CATALOG_SITE = (process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'bobcat').toLowerCase();
const XML = { 'Content-Type': 'text/xml;charset=utf-8' };
const WILDCARD_LOC = /\/(,-w-,|\*|%2A)(\/|$)/i;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));

const origin = (req: NextRequest) => {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return { host, base: `${proto}://${host}` };
};

/** The SDK handler for another sitemap path of the same request (host, headers). */
const sitecoreXml = async (req: NextRequest, pathname: string): Promise<string | null> => {
  const res = await sitecore.GET(new NextRequest(new URL(pathname, req.url), { headers: req.headers }));
  return res.ok ? res.text() : null;
};

/** The Sitecore sitemap without wildcard item URLs (the `*` items are templates for PIM products, not pages). */
const withoutWildcards = (xml: string) => xml.replace(/<url>[\s\S]*?<\/url>/g, (u) => (WILDCARD_LOC.test(locs(u)[0] ?? '') ? '' : u));

/** Site paths of every authored page in the Sitecore sitemap (language prefixes removed), to skip in product sitemaps. */
const authoredPaths = (xml: string) =>
  new Set(
    locs(xml).map((l) => {
      try {
        return new URL(l).pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?(?=\/|$)/, '').replace(/\/$/, '').toLowerCase() || '/';
      } catch {
        return '';
      }
    })
  );

/** Does this category page have a published wildcard child? (the product route needs one) Cached a day. */
const hasWildcard = unstable_cache(
  async (site: string, sitePath: string) => {
    const page = await client
      .getPage([...sitePath.split('/').filter(Boolean), ',-w-,'], { site, locale: 'en' })
      .catch(() => null);
    return page?.layout?.sitecore?.route?.name === '*';
  },
  ['pim', 'wildcard-check'],
  { revalidate: PIM_REVALIDATE_SECONDS, tags: ['pim', 'pim:sitemap'] }
);

/** category slug -> its product entries, for the categories whose products the route can serve. */
const productGroups = async (site: string) => {
  const [entries, categories] = await Promise.all([getProductSitemapEntries(), getCategories()]);
  const byPath = new Map(categories.map((c) => [`${c.sitecore_path.toLowerCase()}/`, c]));
  const groups = new Map<string, { path: string; entries: typeof entries }>();
  for (const e of entries) {
    if (e.status !== 'active' && e.status !== 'discontinued') continue;
    const cat = byPath.get(e.category_path.toLowerCase());
    if (!cat) continue;
    const g = groups.get(cat.slug) ?? { path: cat.sitecore_path, entries: [] };
    g.entries.push(e);
    groups.set(cat.slug, g);
  }
  for (const [slug, g] of [...groups]) if (!(await hasWildcard(site, g.path))) groups.delete(slug);
  return groups;
};

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname.toLowerCase();
  const { host, base } = origin(req);
  const site = siteResolver.getByHost(host).name;
  const isCatalogSite = site.toLowerCase() === CATALOG_SITE;

  try {
    // the Sitecore sitemap, wildcard URLs removed
    if (pathname === '/sitemap-pages.xml') {
      const xml = await sitecoreXml(req, '/sitemap.xml');
      return xml ? new Response(withoutWildcards(xml), { headers: XML }) : new Response('Not Found', { status: 404 });
    }

    // one category's PIM products
    const product = pathname.match(/^\/sitemap-products-([a-z0-9-]+)\.xml$/);
    if (product) {
      const group = isCatalogSite ? (await productGroups(site)).get(product[1]) : undefined;
      if (!group) return new Response('Not Found', { status: 404 });
      const authored = authoredPaths((await sitecoreXml(req, '/sitemap.xml')) ?? '');
      const urls = group.entries
        .map((e) => ({ e, path: `${e.category_path.replace(/\/?$/, '/')}${e.slug}`.toLowerCase() }))
        .filter(({ path }) => !authored.has(path))
        .map(({ e, path }) => {
          const lastmod = e.updated_at ? `<lastmod>${new Date(e.updated_at).toISOString().slice(0, 10)}</lastmod>` : '';
          return `<url><loc>${esc(base + path)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>${e.status === 'active' ? '0.6' : '0.3'}</priority></url>`;
        });
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`,
        { headers: XML }
      );
    }

    // the index: the Sitecore sitemap(s) and the product sitemaps
    if (pathname === '/sitemap.xml' || pathname === '/sitemap-index.xml') {
      const sc = await sitecoreXml(req, '/sitemap.xml');
      // Sitecore serves one sitemap at /sitemap.xml (listed as sitemap-pages.xml), or an index of several (listed as they are)
      const sitecoreMaps = !sc ? [] : /<sitemapindex/.test(sc) ? locs(sc) : [`${base}/sitemap-pages.xml`];
      const productMaps = isCatalogSite
        ? [...(await productGroups(site)).keys()].map((slug) => `${base}/sitemap-products-${slug}.xml`)
        : [];
      const all = [...sitecoreMaps, ...productMaps];
      if (!all.length) return new Response('Not Found', { status: 404 });
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all
          .map((l) => `<sitemap><loc>${esc(l)}</loc></sitemap>`)
          .join('\n')}\n</sitemapindex>`,
        { headers: XML }
      );
    }

    // /sitemap-<n>.xml and anything else: the SDK as before
    return sitecore.GET(req);
  } catch (error) {
    console.log('Sitemap route failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

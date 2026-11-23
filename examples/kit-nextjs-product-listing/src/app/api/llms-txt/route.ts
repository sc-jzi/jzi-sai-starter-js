import { NextRequest } from 'next/server';
import {
  DEFAULT_LLMS_TXT,
  LLMS_TXT_CONTENT_TYPE,
  SiteResolver,
} from '@sitecore-content-sdk/content/site';
import type { SiteInfo } from '@sitecore-content-sdk/nextjs';
import sites from '.sitecore/sites.json';
import client from 'lib/sitecore-client';

/**
 * API route for serving llms.txt
 *
 * Content is authored in Sitecore (Settings → Crawlers → LLMs.txt) as markdown
 * with root-relative links, for example [About](/about). Those links are
 * resolved against the matched site's configured hostname. A wildcard site
 * uses NEXT_PUBLIC_SITE_URL, then NEXT_PUBLIC_BASE_URL, then the loopback host.
 */

export const dynamic = 'force-dynamic';

const SITE_HOST_DELIMITERS = /\||,|;/;

function configuredOrigin(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (!configured) return undefined;

  try {
    return new URL(configured).origin;
  } catch {
    return undefined;
  }
}

/** Hostname used only to select a site. It is never copied into generated links. */
function requestHostname(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const rawHost = forwarded || req.headers.get('host') || req.nextUrl.host || 'localhost';

  try {
    return new URL(`http://${rawHost}`).hostname.toLowerCase() || 'localhost';
  } catch {
    return 'localhost';
  }
}

function concreteSiteHosts(hostName: string | undefined): string[] {
  if (!hostName) return [];

  return hostName
    .replace(/\s/g, '')
    .toLowerCase()
    .split(SITE_HOST_DELIMITERS)
    .filter((hostname) => hostname && !hostname.includes('*'));
}

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * Absolute links use the matched site's configured hostname.
 * The request host is accepted only when it is one of those configured names.
 */
function resolveOrigin(req: NextRequest, site: SiteInfo): string {
  const hosts = concreteSiteHosts(site.hostName);
  const requestHost = requestHostname(req);
  const matchedHost = hosts.find((hostname) => hostname === requestHost);
  const onlyHost = hosts.length === 1 ? hosts[0] : undefined;
  const siteHost = matchedHost ?? onlyHost;

  if (siteHost) {
    return `${isLoopbackHost(siteHost) ? 'http' : 'https'}://${siteHost}`;
  }

  const configured = configuredOrigin();
  if (configured) return configured;

  const host = req.nextUrl.host;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) {
    return `http://${host}`;
  }

  return 'http://localhost:3000';
}

/** True for path-relative hrefs. Absolute, protocol-relative, and fragment links stay as authored. */
function isRelativeHref(href: string): boolean {
  return !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href) && !href.startsWith('//') && !href.startsWith('#');
}

/**
 * Resolves relative markdown links against the request origin.
 * [About](/about) on http://localhost:3000 becomes [About](http://localhost:3000/about).
 */
function resolveRelativeUrls(markdown: string, origin: string): string {
  const base = origin.endsWith('/') ? origin : `${origin}/`;

  return markdown.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
    if (!isRelativeHref(href)) return match;
    return `[${label}](${new URL(href, base).href})`;
  });
}

export async function GET(req: NextRequest) {
  try {
    const hostName = requestHostname(req);
    const sitesNormalized: SiteInfo[] = (
      sites as { name: string; hostName?: string; language?: string }[]
    ).map((site) => ({
      name: site.name,
      hostName: site.hostName ?? '*',
      language: site.language ?? 'en',
    }));
    const site = new SiteResolver(sitesNormalized).getByHost(hostName);
    const content = await client.getLlmsTxt({ siteName: site.name });

    if (!content) {
      return new Response(DEFAULT_LLMS_TXT, {
        status: 404,
        headers: { 'Content-Type': LLMS_TXT_CONTENT_TYPE },
      });
    }

    return new Response(resolveRelativeUrls(content, resolveOrigin(req, site)), {
      status: 200,
      headers: { 'Content-Type': LLMS_TXT_CONTENT_TYPE },
    });
  } catch (error) {
    if (error instanceof Error && (error as { digest?: string }).digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }

    console.log('Llms.txt route handler failed:');
    console.log(error);

    return new Response('Internal Server Error', {
      status: 500,
    });
  }
}

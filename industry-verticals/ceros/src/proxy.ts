import { NextFetchEvent, NextResponse, type NextRequest } from 'next/server';
import {
  defineProxy,
  AppRouterMultisiteProxy,
  PersonalizeProxy,
  RedirectsProxy,
  LocaleProxy,
  BotTrackingProxy,
  PreviewProxy,
} from '@sitecore-content-sdk/nextjs/proxy';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { routing } from './i18n/routing';
import { LOCALE_COOKIE } from './i18n/languages';
import client from './lib/sitecore-client';

/**
 * Remembered language. Sitecore's links carry no locale prefix, so without this a visitor who picked another language
 * drops back to the default language on the next click. The language switcher stores the choice in LOCALE_COOKIE (and
 * opening a prefixed URL stores it too); while a non-default language is chosen, an unprefixed URL redirects to the same
 * path in that language (/products -> /fr-CA/products), and so does a default-language prefix (/en/products). Choosing
 * the default language stops the redirects. Pages editing and preview (Next.js draft mode) are left alone.
 */
const localeOfPath = (pathname: string): string | undefined => {
  const first = pathname.split('/')[1]?.toLowerCase();
  return routing.locales.find((l) => l.toLowerCase() === first);
};

const isDraft = (req: NextRequest) => req.cookies.has('__prerender_bypass');

const localeRedirect = (req: NextRequest): NextResponse | null => {
  if (isDraft(req)) return null;
  const chosen = routing.locales.find(
    (l) => l.toLowerCase() === req.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase()
  );
  if (!chosen || chosen === routing.defaultLocale) return null;
  const { pathname } = req.nextUrl;
  const pathLocale = localeOfPath(pathname);
  if (pathLocale && pathLocale !== routing.defaultLocale) return null;
  // a page shown in the default language because it is not translated yet links with an explicit default-language
  // prefix (/en/products); the switcher never does (it sends the default language unprefixed), so keep the chosen one
  const rest = pathLocale ? pathname.slice(pathLocale.length + 1) : pathname;
  const url = req.nextUrl.clone();
  url.pathname = `/${chosen}${rest === '/' ? '' : rest}`;
  return NextResponse.redirect(url);
};

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const relocalized = localeRedirect(req);
  if (relocalized) return relocalized;

  // PreviewProxy authorizes preview requests
  const preview = new PreviewProxy({
    client: client,
    ...scConfig.api.edge,
  });

  // BotTrackingProxy will detect and track bots before any other proxies run
  const botTracking = new BotTrackingProxy({
    ...scConfig.api.edge,
    sites,
    fetchEvent: event,
  });

  // LocaleProxy and AppRouterMultisiteProxy must always run for App Router routing
  const locale = new LocaleProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    /**
     * List of all supported locales configured in routing.ts
     */
    locales: routing.locales.slice(),
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    // in multilanguage scenarios, we need locale proxy to always run first to ensure locale is set and used correctly by the rest of the proxies
    skip: () => false,
  });

  const multisite = new AppRouterMultisiteProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.multisite,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. files and Next.js API routes), but you may wish to disable more.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    skip: () => false,
  });

  // Instantiate proxies - they will use Edge config if available, otherwise fall back to local config
  // Each proxy will skip processing if required API configuration is not available
  const redirects = new RedirectsProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.api.local,
    ...scConfig.redirects,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    skip: () => false,
  });

  const personalize = new PersonalizeProxy({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.personalize,
    // This function determines if the proxy should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge proxy runs on every request.
    // NOTE: Personalize requires Edge configuration and cannot work with local containers.
    // The proxy will disable itself if Edge config is not present.
    skip: () => false,
    // This is an example of how to provide geo data for personalization.
    // The provided callback will be called on each request to extract geo data.
    // extractGeoDataCb: () => {
    //   return {
    //     city: 'Athens',
    //     country: 'Greece',
    //     region: 'Attica',
    //   };
    // },
  });

  const res = await defineProxy(preview, botTracking, locale, multisite, redirects, personalize).exec(req);
  const pathLocale = localeOfPath(req.nextUrl.pathname);
  if (pathLocale && !isDraft(req) && req.cookies.get(LOCALE_COOKIE)?.value !== pathLocale) {
    res.cookies.set(LOCALE_COOKIE, pathLocale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export const config = {
  /*
   * Match all paths except for:
   * 1. API route handlers
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|sitemap|robots|_next/|healthz|sitecore/api/|-/|favicon.ico|sc_logo.svg).*)',
  ],
};

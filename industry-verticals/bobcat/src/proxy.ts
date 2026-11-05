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
import client from './lib/sitecore-client';
import { portalPath, SESSION_COOKIE, verifySessionToken } from './lib/portal/session';

/**
 * My Machine portal: /my-machine pages need a portal session (else the login page, with a returnUrl); a signed-in
 * visitor who opens the login page goes straight to the portal. Pages editing and preview run in Next.js draft mode
 * (the __prerender_bypass cookie) and are let through, so the page builder can always open the portal pages.
 */
const portalGuard = async (req: NextRequest): Promise<NextResponse | null> => {
  const area = portalPath(req.nextUrl.pathname);
  if (!area || req.cookies.has('__prerender_bypass')) return null;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const base = req.nextUrl.pathname.replace(/\/my-machine(\/.*)?$/i, '');
  if (area === 'protected' && !session) {
    const url = req.nextUrl.clone();
    url.pathname = `${base}/my-machine/login`;
    url.search = `?returnUrl=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  if (area === 'login' && session) {
    const url = req.nextUrl.clone();
    url.pathname = `${base}/my-machine`;
    url.search = '';
    return NextResponse.redirect(url);
  }
  return null;
};

/**
 * Remembered language: the language switcher stores the visitor's choice in LOCALE_COOKIE. Sitecore's links carry no
 * locale prefix, so while a non-default language is chosen an unprefixed URL redirects to the same path in that language
 * (/equipment -> /ko-KR/equipment); choosing the default language in the switcher stores it and stops the redirects.
 * Opening a prefixed URL directly remembers that language too. Pages editing and preview (draft mode) are left alone.
 */
const LOCALE_COOKIE = 'site_locale';

const localeOfPath = (pathname: string): string | undefined => {
  const first = pathname.split('/')[1]?.toLowerCase();
  return routing.locales.find((l) => l.toLowerCase() === first);
};

const localeRedirect = (req: NextRequest): NextResponse | null => {
  if (req.cookies.has('__prerender_bypass')) return null;
  const chosen = routing.locales.find((l) => l.toLowerCase() === req.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase());
  if (!chosen || chosen === routing.defaultLocale || localeOfPath(req.nextUrl.pathname)) return null;
  const url = req.nextUrl.clone();
  url.pathname = `/${chosen}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
  return NextResponse.redirect(url);
};

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  const relocalized = localeRedirect(req);
  if (relocalized) return relocalized;

  const guarded = await portalGuard(req);
  if (guarded) return guarded;

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
  if (pathLocale && !req.cookies.has('__prerender_bypass') && req.cookies.get(LOCALE_COOKIE)?.value !== pathLocale) {
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

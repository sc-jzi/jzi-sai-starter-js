import { JSX } from 'react';
import { headers } from 'next/headers';
import { routing } from 'src/i18n/routing';
import client from 'src/lib/sitecore-client';

/**
 * Canonical and hreflang links for every page, rendered once per page by the route (src/app/[site]/[locale]/[[...path]]).
 * React moves <link> tags into the document <head>.
 *
 * - hreflang: one link per language the page has a version in (and x-default = the default language), the same set on
 *   every language version so the links point both ways.
 * - canonical: the page's own URL in its language. A page shown in the default language because it has no version in
 *   the requested one (the fallback in page.tsx) points to the default-language URL and is left out of hreflang, so the
 *   fallback copies never count as duplicate content.
 * URLs are absolute, on the host the request came in on (localhost, Vercel or a production domain).
 */
type AlternateLinksProps = {
  site: string;
  /** the language in the URL */
  locale: string;
  /** the language of the content actually shown (the default language on a fallback page) */
  contentLocale: string;
  path?: string[];
  /**
   * the page's CanonicalUrl field (src/lib/seo-controls.ts): an absolute URL or a site path. When set it replaces the
   * computed canonical, and the hreflang set is left out (a page that declares another URL canonical is not a
   * language alternate itself).
   */
  canonicalOverride?: string;
};

const sameLocale = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

const AlternateLinks = async ({
  site,
  locale,
  contentLocale,
  path,
  canonicalOverride,
}: AlternateLinksProps): Promise<JSX.Element> => {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const pagePath = path?.length ? `/${path.join('/')}` : '';
  const urlFor = (lang: string) =>
    `${proto}://${host}${`${sameLocale(lang, routing.defaultLocale) ? '' : `/${lang}`}${pagePath}` || '/'}`;

  if (canonicalOverride) {
    const href = /^https?:\/\//i.test(canonicalOverride)
      ? canonicalOverride
      : `${proto}://${host}${canonicalOverride.startsWith('/') ? '' : '/'}${canonicalOverride}`;
    return <link rel="canonical" href={href} />;
  }

  // the languages this page has a version in (the shown language always does)
  const languages = (
    await Promise.all(
      routing.locales.map(async (lang) =>
        sameLocale(lang, contentLocale) || (await client.getPage(path ?? [], { site, locale: lang })) ? lang : null
      )
    )
  ).filter((lang): lang is string => !!lang);

  const translated = sameLocale(locale, contentLocale);
  const canonical = urlFor(translated ? locale : contentLocale);

  return (
    <>
      <link rel="canonical" href={canonical} />
      {languages.length > 1 &&
        languages.map((lang) => <link key={lang} rel="alternate" hrefLang={lang} href={urlFor(lang)} />)}
      {languages.length > 1 && <link rel="alternate" hrefLang="x-default" href={urlFor(routing.defaultLocale)} />}
    </>
  );
};

export default AlternateLinks;

import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode, headers as nextHeaders } from 'next/headers';
import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import sites from '.sitecore/sites.json';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ site: string; locale: string; path?: string[]; [key: string]: string | string[] | undefined }>;
};

/**
 * The page in the requested language. A page with no version in that language (not translated yet) is shown in the
 * default language instead of a 404, so a visitor browsing in another language never hits a dead end. Set
 * LANGUAGE_FALLBACK=false to answer 404 instead.
 */
const getPageWithFallback = async (path: string[] | undefined, site: string, locale: string) => {
  const page = await client.getPage(path ?? [], { site, locale });
  if (page || locale === routing.defaultLocale || process.env.LANGUAGE_FALLBACK === 'false') return page;
  return client.getPage(path ?? [], { site, locale: routing.defaultLocale });
};

export default async function Page({ params }: PageProps) {
  const { site, locale, path } = await params;

  // Set site and locale to be available in src/i18n/request.ts for fetching the dictionary
  setRequestLocale(`${site}_${locale}`);

  const draft = await draftMode();

  // Fetch the page data from Sitecore
  let page;
  if (draft.isEnabled) {
    const headers = await nextHeaders();
    const previewData = client.getPreviewData(headers);

    if (isDesignLibraryPreviewData(previewData)) {
      page = await client.getDesignLibraryData(previewData);
    } else {
      page = await client.getPreview(previewData);
    }
  } else {
    page = await getPageWithFallback(path, site, locale);
  }

  // If the page is not found, return a 404
  if (!page) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <Providers page={page}>
        <Layout page={page} />
      </Providers>
    </NextIntlClientProvider>
  );
}

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const generateStaticParams = async () => {
  const siteNames = sites.map((site: SiteInfo) => site.name);

  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    return await client.getAppRouterStaticParams(siteNames, routing.locales.slice());
  }
  // Next.js 16 requires at least one result
  // Return a default param for the root page
  return [
    {
      site: siteNames[0] || scConfig.defaultSite || 'default',
      locale: routing.defaultLocale || scConfig.defaultLanguage,
      path: [],
    },
  ];
};
type TextValue = { value?: unknown };
type ImageValue = { value?: { src?: string; alt?: string; width?: string | number; height?: string | number } };
type LinkValue = { value?: { href?: string } };
type SeoFields = RouteFields & {
  Excerpt?: TextValue;
  Thumbnail?: ImageValue;
  baseMetadataTitle?: TextValue;
  baseMetadataDescription?: TextValue;
  baseMetadataKeywords?: TextValue;
  baseMetadataAuthor?: TextValue;
  baseMetadataUrl?: LinkValue;
  baseOgTitle?: TextValue;
  baseOgDescription?: TextValue;
  baseOgType?: TextValue;
  baseOgImage?: ImageValue;
};

const text = (f?: TextValue) =>
  typeof f?.value === 'string' || typeof f?.value === 'number' ? String(f.value).trim() || undefined : undefined;
const num = (v?: string | number) => (v != null && Number(v) > 0 ? Number(v) : undefined);

// Metadata for the page from its SEO fields (baseMetadata* / baseOg*), with fallbacks to the page's Title, Excerpt and Thumbnail.
export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { path, site, locale } = await params;

  // The same call as for rendering the page. Should be cached by default react behavior
  const page = await getPageWithFallback(path, site, locale);
  const f = (page?.layout.sitecore.route?.fields ?? {}) as SeoFields;

  // absolute URLs (canonical, og:url) are built on the host that served the request
  const h = await nextHeaders();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  const metadataBase = host ? new URL(`${proto}://${host}`) : undefined;

  const title = text(f.baseMetadataTitle) ?? text(f.Title) ?? 'Page';
  const description = text(f.baseMetadataDescription) ?? text(f.baseOgDescription) ?? text(f.Excerpt);
  const ogTitle = text(f.baseOgTitle) ?? title;
  const ogDescription = text(f.baseOgDescription) ?? description;
  const canonical = f.baseMetadataUrl?.value?.href || undefined;
  const image = f.baseOgImage?.value?.src ? f.baseOgImage.value : f.Thumbnail?.value?.src ? f.Thumbnail.value : undefined;
  const images = image?.src
    ? [{ url: image.src, alt: image.alt || ogTitle, width: num(image.width), height: num(image.height) }]
    : undefined;
  const author = text(f.baseMetadataAuthor);

  return {
    metadataBase,
    title,
    description,
    keywords: text(f.baseMetadataKeywords),
    authors: author ? [{ name: author }] : undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: text(f.baseOgType) === 'article' ? 'article' : 'website',
      url: canonical,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: ogTitle,
      description: ogDescription,
      images: images?.map((i) => i.url),
    },
  };
};

import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import { notFound } from 'next/navigation';
import { draftMode, headers as nextHeaders } from 'next/headers';
import { SiteInfo } from '@sitecore-content-sdk/nextjs';
import sites from '.sitecore/sites.json';
import { routing } from 'src/i18n/routing';
import scConfig from 'sitecore.config';
import client from 'src/lib/sitecore-client';
import Layout, { RouteFields } from 'src/Layout';
import Providers from 'src/Providers';
import AlternateLinks from 'src/AlternateLinks';
import { readSeoControls, SeoRouteFields } from 'src/lib/seo-controls';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { resolveProductPage } from 'src/lib/pim/product-page';
import { attachCategoryListing } from 'src/lib/pim/listing';
import { attachMachineFitment } from 'src/lib/pim/fitment';
import { productOf } from 'src/lib/pim/product-context';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ site: string; locale: string; path?: string[]; [key: string]: string | string[] | undefined }>;
};

/**
 * The page in the requested language; a page that has no version in that language (not translated yet) is shown in the
 * default language instead of a 404, so a visitor browsing in French or Korean never hits a dead end.
 */
const getPageWithFallback = async (path: string[] | undefined, site: string, locale: string) => {
  const page = await client.getPage(path ?? [], { site, locale });
  if (page || locale === routing.defaultLocale) return page;
  return client.getPage(path ?? [], { site, locale: routing.defaultLocale });
};

/**
 * The page for a path. A category's `*` (wildcard) item answers every unknown slug under it; such a page is a PIM product
 * page, merged with the product, or null (404) when the slug is not a product of that category. A category page with a
 * ModelListing also gets the category's PIM products, and a machine page the attachments that fit it (src/lib/pim).
 */
const getSitePage = async (path: string[] | undefined, site: string, locale: string) => {
  const page = await resolveProductPage(await getPageWithFallback(path, site, locale), path);
  return attachMachineFitment(await attachCategoryListing(page, path), path);
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
    page = await getSitePage(path, site, locale);
  }

  // If the page is not found, return a 404
  if (!page) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      {!draft.isEnabled && (
        <AlternateLinks
          site={site}
          locale={locale}
          contentLocale={page.locale}
          path={path}
          canonicalOverride={
            readSeoControls(page.layout.sitecore.route?.fields as SeoRouteFields | undefined).canonicalHref
          }
        />
      )}
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
// Metadata fields for the page.
export const generateMetadata = async ({ params }: PageProps) => {
  const { path, site, locale } = await params;

  // The same call as for rendering the page. Should be cached by default react behavior
  const page = await getSitePage(path, site, locale);
  const product = productOf(page);
  const { noIndex, noFollow } = readSeoControls(page?.layout.sitecore.route?.fields as SeoRouteFields | undefined);
  return {
    title: product
      ? `${product.name} | Bobcat Company`
      : (page?.layout.sitecore.route?.fields as RouteFields)?.Title?.value?.toString() || 'Page',
    // <meta name="robots"> only when an editor ticked noindex or nofollow on the page (the default is index, follow)
    ...((noIndex || noFollow) && { robots: { index: !noIndex, follow: !noFollow } }),
  };
};

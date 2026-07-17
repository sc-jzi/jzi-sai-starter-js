import { setCachedPageParams } from '@sitecore-content-sdk/nextjs';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const { site, locale } = await params;

  setCachedPageParams({ locale, site });

  return children;
}
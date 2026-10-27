import { setCachedPageParams } from '@sitecore-content-sdk/nextjs';

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string; locale: string }>;
}) {
  const raw = await params;
  const site = decodeURIComponent(raw.site);
  const locale = decodeURIComponent(raw.locale);

  setCachedPageParams({ locale, site });

  return (
      children
  );
}


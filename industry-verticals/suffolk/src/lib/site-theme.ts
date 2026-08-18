const SITE_THEME_CLASS_MAP: Record<string, string> = {
  Financial: 'site-financial',
  Services: 'site-services',
  'suffolk-county': 'site-suffolk',
  SuffolkCounty: 'site-suffolk',
  suffolk: 'site-suffolk',
  Suffolk: 'site-suffolk',
};

const DEFAULT_SITE_THEME_CLASS = 'site-suffolk';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return SITE_THEME_CLASS_MAP[siteName] ?? DEFAULT_SITE_THEME_CLASS;
}

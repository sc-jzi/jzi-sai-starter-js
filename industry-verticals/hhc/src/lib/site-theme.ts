const SITE_THEME_CLASS_MAP: Record<string, string> = {
  HHC: 'site-hhc',
  Financial: 'site-hhc',
  Services: 'site-hhc-alt',
  Excelitas: 'site-hhc',
};

const DEFAULT_SITE_THEME_CLASS = 'site-hhc';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return SITE_THEME_CLASS_MAP[siteName] ?? DEFAULT_SITE_THEME_CLASS;
}

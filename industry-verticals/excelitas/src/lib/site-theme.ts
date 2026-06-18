const SITE_THEME_CLASS_MAP: Record<string, string> = {
  Financial: 'site-excelitas',
  Services: 'site-excelitas-alt',
  Excelitas: 'site-excelitas',
};

const DEFAULT_SITE_THEME_CLASS = 'site-excelitas';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return SITE_THEME_CLASS_MAP[siteName] ?? DEFAULT_SITE_THEME_CLASS;
}

const SITE_THEME_CLASS_MAP: Record<string, string> = {
  ConcentricUSA: 'site-concentricusa',
  Financial: 'site-financial',
  Services: 'site-services',
};

const DEFAULT_SITE_THEME_CLASS = 'site-concentricusa';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return SITE_THEME_CLASS_MAP[siteName] ?? DEFAULT_SITE_THEME_CLASS;
}

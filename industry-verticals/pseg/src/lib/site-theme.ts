const SITE_THEME_CLASS_MAP: Record<string, string> = {
  Financial: 'site-financial',
  Services: 'site-services',
  pseg: 'site-pseg',
  PSEG: 'site-pseg',
  Pseg: 'site-pseg',
};

const DEFAULT_SITE_THEME_CLASS = 'site-pseg';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return SITE_THEME_CLASS_MAP[siteName] ?? DEFAULT_SITE_THEME_CLASS;
}

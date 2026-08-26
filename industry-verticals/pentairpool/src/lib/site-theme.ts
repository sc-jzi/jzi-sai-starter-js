const SITE_THEME_CLASS_MAP: Record<string, string> = {
  Financial: 'site-financial',
  Services: 'site-services',
  pentairpool: 'site-pentairpool',
  PentairPool: 'site-pentairpool',
  'pentair-pool': 'site-pentairpool',
};

const DEFAULT_SITE_THEME_CLASS = 'site-financial';

export function getSiteThemeClass(siteName: string | undefined): string {
  if (!siteName) {
    return DEFAULT_SITE_THEME_CLASS;
  }

  return (
    SITE_THEME_CLASS_MAP[siteName] ??
    SITE_THEME_CLASS_MAP[siteName.toLowerCase()] ??
    DEFAULT_SITE_THEME_CLASS
  );
}

/**
 * The languages the site offers: the one list the locale routing (src/i18n/routing.ts), the request proxy (src/proxy.ts)
 * and the language switcher read. Client-safe (no Sitecore config import).
 *
 * Configure with NEXT_PUBLIC_SITE_LANGUAGES as comma-separated "code:Label" pairs, using the Sitecore language names, e.g.
 *   NEXT_PUBLIC_SITE_LANGUAGES=en:English,fr-CA:Français,ja-JP:日本語
 * The default language (NEXT_PUBLIC_DEFAULT_LANGUAGE, else "en") is always offered, first, and its URLs have no prefix.
 */
export type SiteLanguage = { code: string; label: string };

const DEFAULT_SITE_LANGUAGES = 'en:English,fr-CA:Français,ja-JP:日本語';

export const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

/** The cookie that remembers the visitor's chosen language (set by the switcher and by src/proxy.ts). */
export const LOCALE_COOKIE = 'site_locale';

export const sameLocale = (a?: string, b?: string): boolean =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

const parseLanguages = (value: string): SiteLanguage[] =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [code, ...label] = entry.split(':');
      return { code: code.trim(), label: label.join(':').trim() || code.trim() };
    })
    .filter((lang) => lang.code);

const configured = parseLanguages(process.env.NEXT_PUBLIC_SITE_LANGUAGES || DEFAULT_SITE_LANGUAGES);

export const SITE_LANGUAGES: SiteLanguage[] = [
  configured.find((lang) => sameLocale(lang.code, DEFAULT_LANGUAGE)) ?? {
    code: DEFAULT_LANGUAGE,
    label: DEFAULT_LANGUAGE,
  },
  ...configured.filter((lang) => !sameLocale(lang.code, DEFAULT_LANGUAGE)),
];

/** The configured language matching a code (case-insensitive), if any. */
export const findLanguage = (code?: string): SiteLanguage | undefined =>
  SITE_LANGUAGES.find((lang) => sameLocale(lang.code, code));

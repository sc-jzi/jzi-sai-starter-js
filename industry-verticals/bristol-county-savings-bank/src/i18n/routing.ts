import { defineRouting } from 'next-intl/routing';
import sitecoreConfig from 'sitecore.config';
import { SITE_LANGUAGES } from './languages';

export const routing = defineRouting({
  // A list of all locales that are supported: every language the site offers (src/i18n/languages.ts). A locale missing
  // here never reaches Sitecore, whatever the language switcher shows.
  locales: SITE_LANGUAGES.map((lang) => lang.code),

  // Used when no locale matches
  defaultLocale: sitecoreConfig.defaultLanguage,

  // No prefix is added for the default locale ("as-needed").
  // For other configuration options, refer to the next-intl documentation:
  // https://next-intl.dev/docs/routing/configuration
  localePrefix: 'as-needed',

  // The language follows the URL and the visitor's choice in the language switcher only: no switch based on the
  // browser's Accept-Language header.
  localeDetection: false,
});

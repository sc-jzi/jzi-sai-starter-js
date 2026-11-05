import { defineRouting } from 'next-intl/routing';
import sitecoreConfig from 'sitecore.config';

export const routing = defineRouting({
  // A list of all locales that are supported: the default language plus the languages the site is translated into in
  // Sitecore (French (Canada) and Korean). A locale missing here never reaches Sitecore, whatever the language switcher offers.
  locales: [sitecoreConfig.defaultLanguage, 'fr-CA', 'ko-KR'],

  // Used when no locale matches
  defaultLocale: sitecoreConfig.defaultLanguage,

  // No prefix is added for the default locale ("as-needed").
  // For other configuration options, refer to the next-intl documentation:
  // https://next-intl.dev/docs/routing/configuration
  localePrefix: 'as-needed',

  // The language follows the URL only (the language switcher): no redirect from the browser's Accept-Language or a
  // remembered locale cookie, so a visitor on "/" always sees English until they pick another language.
  localeDetection: false,
});

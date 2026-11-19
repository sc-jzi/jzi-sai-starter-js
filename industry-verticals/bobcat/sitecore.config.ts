import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
export default defineConfig({
  // one app serves every site of the Bobcat collection (NA on any host, EU on its own host name, e.g. eu.localhost)
  multisite: {
    enabled: true,
  },
  generateStaticPaths: false,
  // Redirect maps (Settings/Redirects in Sitecore) also apply on localhost: the SDK default turns them off in development.
  // locales = the languages of src/i18n/routing.ts (not imported: routing imports this file), so /fr-CA/... URLs match too.
  redirects: {
    enabled: true,
    locales: ['en', 'fr-CA', 'ko-KR'],
  },
});

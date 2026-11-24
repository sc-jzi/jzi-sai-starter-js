import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
const path = require('path');
const SassAlias = require('sass-alias');

const nextConfig: NextConfig = {
  // Enable Turbopack file system caching for faster dev startup (beta)
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // Metadata (title, description, canonical, og:*, twitter:*) always rendered in <head>, for every user agent. Next.js otherwise
  // streams it into <body> for user agents it does not list as bots, so a search crawler it does not recognise could miss it.
  htmlLimitedBots: /.*/,

  turbopack: {
    resolveAlias: {
      // Bootstrap's `@import "progress"` otherwise hits the npm `progress` package.
      progress: path.join(process.cwd(), 'node_modules/bootstrap/scss/_progress.scss').replace(/\\/g, '/'),
    },
  },

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    // An SVG served from a URL that does not end in .svg (a Content Hub public link, a media handler URL) otherwise fails with
    // 'type "image/svg+xml" but dangerouslyAllowSVG is disabled' and the image stays blank. The CSP sandbox and attachment disposition are the
    // settings the Next.js docs require with it: scripts inside an SVG never run, and the optimizer's SVG response is never shown as a page.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
	  {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // use this configuration to serve the sitemap.xml and robots.txt files from the API route handlers
  rewrites: async () => {
    return [
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap',
        locale: false,
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
        locale: false,
      },
    ];
  },

  sassOptions: {
    loadPaths: [
      // Bootstrap must come before node_modules so `@import "progress"`
      // resolves to bootstrap/scss/_progress.scss, not the npm `progress` package.
      path.join(process.cwd(), 'node_modules/bootstrap/scss'),
      process.cwd(),
      path.join(process.cwd(), 'src/assets/sass/abstracts'),
      path.join(process.cwd(), 'node_modules'),
    ],
    importer: new SassAlias({
      '@globals': path.join(process.cwd(), './src/assets', 'globals'),
      '@fontawesome': path.join(process.cwd(), './node_modules', 'font-awesome'),
      '@vars': path.join(process.cwd(), './src/assets/sass/abstracts'),
    }).getImporter(),
    // temporary measure until new versions of bootstrap and font-awesome released
    quietDeps: true,
    silenceDeprecations: ['import', 'legacy-js-api'],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

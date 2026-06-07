const path = require('path');
const SassAlias = require('sass-alias');

// const jssConfig = require('./src/temp/config');
// const plugins = require('./src/temp/next-config-plugins') || {};

// const publicUrl = jssConfig.publicUrl;

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Set assetPrefix to our public URL
  // assetPrefix: publicUrl,

  // Allow specifying a distinct distDir when concurrently running app in a container
  distDir: process.env.NEXTJS_DIST_DIR || '.next',

  // Make the same PUBLIC_URL available as an environment variable on the client bundle
  // env: {
  //   PUBLIC_URL: publicUrl,
  // },

  i18n: {
    // These are all the locales you want to support in your application.
    // These should generally match (or at least be a subset of) those in Sitecore.
    // DEMO TEAM CUSTOMIZATION - Remove unused languages and add some
    locales: [
      'en',
      'fr-CA',
      'ja-JP',
    ],
    // END CUSTOMIZATION
    // This is the locale that will be used when visiting a non-locale
    // prefixed path e.g. `/styleguide`.
    defaultLocale: process.env.DEFAULT_LANGUAGE || process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Disable the X-Powered-By header. Follows security best practices.
  poweredByHeader: false,

  // use this configuration to ensure that only images from the whitelisted domains
  // can be served from the Next.js Image Optimization API
  // see https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'edge*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'xmc-*.**',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'starter-*.**',
        port: '',
      },
    ],
  },

  // async rewrites() {
  //   // When in connected mode we want to proxy Sitecore paths off to Sitecore
  //   return [
  //     // API endpoints
  //     {
  //       source: '/sitecore/api/:path*',
  //       destination: `${jssConfig.sitecoreApiHost}/sitecore/api/:path*`,
  //     },
  //     // media items
  //     {
  //       source: '/-/:path*',
  //       destination: `${jssConfig.sitecoreApiHost}/-/:path*`,
  //     },
  //     // healthz check
  //     {
  //       source: '/healthz',
  //       destination: '/api/healthz',
  //     },
  //     // rewrite for Sitecore service pages
  //     {
  //       source: '/sitecore/service/:path*',
  //       destination: `${jssConfig.sitecoreApiHost}/sitecore/service/:path*`,
  //     },
  //   ];
  // },

  async rewrites() {
    return [
      // healthz check
      {
        source: '/healthz',
        destination: '/api/healthz',
      },
      // robots route
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      // sitemap route
      {
        source: '/sitemap:id([\\w-]{0,}).xml',
        destination: '/api/sitemap'
      },
      // feaas api route
      {
        source: '/feaas-render',
        destination: '/api/editing/feaas/render',
      },
    ];
  },

  webpack: (config, options) => {
    if (!options.isServer) {
      // Add a loader to strip out getComponentServerProps from components in the client bundle
      config.module.rules.unshift({
        test: /src\\components\\.*\.tsx$/,
        use: ['@sitecore-content-sdk\\nextjs\\component-props-loader'],
      });
    } else {
      // Force use of CommonJS on the server for FEAAS SDK since Content SDK also uses CommonJS entrypoint to FEAAS SDK.
      // This prevents issues arising due to FEAAS SDK's dual CommonJS/ES module support on the server (via conditional exports).
      // See https://nodejs.org/api/packages.html#dual-package-hazard.
      config.externals = [
        {
          '@sitecore-feaas/clientside/react': 'commonjs @sitecore-feaas/clientside/react',
          '@sitecore/byoc': 'commonjs @sitecore/byoc',
          '@sitecore/byoc/react': 'commonjs @sitecore/byoc/react',
        },
        ...config.externals,
      ];
    }

    return config;
  },

    // Add sass settings for SXA themes and styles
  sassOptions: {
    importer: new SassAlias({
      '@globals': path.join(process.cwd(), './src/assets', 'globals'),
      '@fontawesome': path.join(process.cwd(), './node_modules', 'font-awesome'),
    }).getImporter(),
    // temporary measure until new versions of bootstrap and font-awesome released
    quietDeps: true,    
    silenceDeprecations: ["import", "legacy-js-api"],
  },

};

module.exports = nextConfig;

// module.exports = () => {
//   // Run the base config through any configured plugins
//   return Object.values(plugins).reduce((acc, plugin) => plugin(acc), nextConfig);
// };

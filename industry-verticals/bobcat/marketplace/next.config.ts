import type { NextConfig } from 'next';
import path from 'node:path';

/**
 * The Product Enrichment Marketplace app runs inside a SitecoreAI iframe (Full screen extension point, route /catalog).
 * It lives inside the Bobcat site's folder, so its root is pinned here: otherwise Next.js takes the site's lockfile as
 * the workspace root and compiles the site's src/proxy.ts into this app.
 */
const root = path.resolve(__dirname);
const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }] },
};

export default nextConfig;

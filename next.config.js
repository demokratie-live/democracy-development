/* eslint-disable import/no-extraneous-dependencies */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  experimental: {
    outputStandalone: true,
  },
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  trailingSlash: true,
  basePath: '',
  // The starter code load resources from `public` folder with `router.basePath` in React components.
  // So, the source code is "basePath-ready".
  // You can remove `basePath` if you don't need it.
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async rewrites() {
    return [
      {
        source: '/apple-app-site-association',
        destination: '/api/apple-app-site-association',
      },
      {
        source: '/.well-known/assetlinks.json',
        destination: '/api/assetlinks',
      },
    ];
  },
});

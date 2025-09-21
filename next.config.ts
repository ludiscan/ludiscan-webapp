import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/i,
      type: 'asset/source',
    });
    config.module.rules.push({
      type: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  turbopack: {
    root: __dirname,
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;

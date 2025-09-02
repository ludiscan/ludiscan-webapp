import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/i,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;

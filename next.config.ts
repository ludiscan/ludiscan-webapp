import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  basePath: '/ludiscan/view',
  output: 'standalone',
};

export default nextConfig;

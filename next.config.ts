import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx'],
  basePath: '/ludiscan/view',
  output: 'standalone',
};

export default nextConfig;

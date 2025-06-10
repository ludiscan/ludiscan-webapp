import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  output: 'standalone',
};

export default nextConfig;

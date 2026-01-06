import type { NextConfig } from 'next';

import packageJson from './package.json';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  output: 'standalone',

  // Security headers configuration
  // Implements OWASP recommended security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            // Content Security Policy (CSP)
            // Prevents XSS, clickjacking, and other code injection attacks
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || ''} https://www.google-analytics.com https://api.github.com`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              'upgrade-insecure-requests',
            ]
              .join('; ')
              .replace(/\s+/g, ' '),
          },
          {
            // Prevent clickjacking attacks
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Control browser features and APIs
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()', // Disable FLoC
            ].join(', '),
          },
          {
            // Enforce HTTPS (only in production)
            key: 'Strict-Transport-Security',
            value: process.env.NODE_ENV === 'production' ? 'max-age=63072000; includeSubDomains; preload' : '',
          },
          {
            // Enable XSS protection (legacy browsers)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ].filter((header) => header.value !== ''), // Remove empty headers
      },
    ];
  },

  webpack(config) {
    // .md は文字列としてインポート
    config.module.rules.push({
      test: /\.md$/i,
      type: 'asset/source',
    });

    // .svg を JS/TS から import したときは React コンポーネント（SVGR）
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/, // JS/TS からの import のみ
      use: ['@svgr/webpack'],
    });

    // それ以外（例: CSS からの参照など）はファイルとして扱う
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { not: [/\.[jt]sx?$/] },
      type: 'asset/resource',
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

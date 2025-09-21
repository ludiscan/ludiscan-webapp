import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'api.ts'],
  output: 'standalone',
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

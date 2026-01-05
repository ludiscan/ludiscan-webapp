import Head from 'next/head';

import { env } from '@src/config/env';
import { useLocale } from '@src/hooks/useLocale';

export interface SeoProps {
  /** Page title - will be appended with site name */
  title?: string;
  /** Meta description for the page */
  description?: string;
  /** Canonical URL path (e.g., '/home', '/login') */
  path?: string;
  /** OGP image URL (defaults to site OGP image) */
  ogImage?: string;
  /** OGP type (defaults to 'website') */
  ogType?: 'website' | 'article';
  /** Should the page be indexed by search engines (defaults to true) */
  noIndex?: boolean;
  /** Additional keywords for meta tag */
  keywords?: string[];
}

const SITE_NAME = 'Ludiscan';
const DEFAULT_DESCRIPTION = {
  en: 'Ludiscan - Player position tracking and heatmap visualization tool for game analytics. Analyze gameplay data with 2D/3D heatmaps and AI-powered insights.',
  ja: 'Ludiscan - ゲーム分析のためのプレイヤー位置追跡とヒートマップ可視化ツール。2D/3D ヒートマップと AI による分析でゲームプレイデータを解析します。',
};
const DEFAULT_KEYWORDS = ['heatmap', 'game analytics', 'player tracking', 'visualization', 'Ludiscan'];

/**
 * SEO component for managing page-specific meta tags
 * Provides dynamic title, description, OGP, canonical, and hreflang tags
 */
export const Seo = ({ title, description, path = '', ogImage, ogType = 'website', noIndex = false, keywords = [] }: SeoProps) => {
  const { locale } = useLocale();
  const baseUrl = env.NEXT_PUBLIC_HOSTNAME;

  // Construct full page title
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Use provided description or default based on locale
  const pageDescription = description ?? DEFAULT_DESCRIPTION[locale];

  // Construct canonical URL
  const canonicalUrl = `${baseUrl}${path}`;

  // Default OGP image
  const ogImageUrl = ogImage ?? `${baseUrl}/ogp.png`;

  // Combine default and custom keywords
  const allKeywords = [...DEFAULT_KEYWORDS, ...keywords].join(', ');

  return (
    <Head>
      {/* Basic meta tags */}
      <title>{pageTitle}</title>
      <meta name='description' content={pageDescription} />
      <meta name='keywords' content={allKeywords} />

      {/* Robots control */}
      {noIndex && <meta name='robots' content='noindex, nofollow' />}

      {/* Canonical URL */}
      <link rel='canonical' href={canonicalUrl} />

      {/* Hreflang for internationalization */}
      <link rel='alternate' hrefLang='en' href={`${baseUrl}${path}`} />
      <link rel='alternate' hrefLang='ja' href={`${baseUrl}${path}`} />
      <link rel='alternate' hrefLang='x-default' href={`${baseUrl}${path}`} />

      {/* Open Graph tags */}
      <meta property='og:title' content={pageTitle} />
      <meta property='og:description' content={pageDescription} />
      <meta property='og:type' content={ogType} />
      <meta property='og:url' content={canonicalUrl} />
      <meta property='og:image' content={ogImageUrl} />
      <meta property='og:site_name' content={SITE_NAME} />
      <meta property='og:locale' content={locale === 'ja' ? 'ja_JP' : 'en_US'} />
      <meta property='og:locale:alternate' content={locale === 'ja' ? 'en_US' : 'ja_JP'} />

      {/* Twitter Card tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={pageTitle} />
      <meta name='twitter:description' content={pageDescription} />
      <meta name='twitter:image' content={ogImageUrl} />
    </Head>
  );
};

import type { GetServerSideProps } from 'next';

const BASE_URL = 'https://ludiapp.matuyuhi.com';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Static pages that should be indexed
 */
const staticPages: SitemapUrl[] = [
  { loc: '/', changefreq: 'weekly', priority: 1.0 },
  { loc: '/login', changefreq: 'monthly', priority: 0.8 },
];

/**
 * Generate XML sitemap content
 */
function generateSitemapXml(urls: SitemapUrl[]): string {
  const today = new Date().toISOString().split('T')[0];

  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${BASE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod ?? today}</lastmod>
    <changefreq>${url.changefreq ?? 'weekly'}</changefreq>
    <priority>${url.priority ?? 0.5}</priority>
  </url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${urlEntries}
</urlset>`;
}

/**
 * Sitemap page component (not actually rendered)
 */
function Sitemap() {
  // This component is never rendered - getServerSideProps returns XML directly
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Generate sitemap XML
  const sitemap = generateSitemapXml(staticPages);

  // Set content type and cache headers
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  // Write sitemap and end response
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;

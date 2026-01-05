import Head from 'next/head';

import { env } from '@src/config/env';

interface OrganizationSchema {
  type: 'Organization';
  name: string;
  url: string;
  logo?: string;
}

interface WebSiteSchema {
  type: 'WebSite';
  name: string;
  url: string;
  description?: string;
}

interface SoftwareApplicationSchema {
  type: 'SoftwareApplication';
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  description?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchema {
  type: 'BreadcrumbList';
  items: BreadcrumbItem[];
}

type SchemaType = OrganizationSchema | WebSiteSchema | SoftwareApplicationSchema | BreadcrumbSchema;

interface JsonLdProps {
  schema: SchemaType;
}

const baseUrl = env.NEXT_PUBLIC_HOSTNAME;

/**
 * Generate JSON-LD structured data for different schema types
 */
function generateJsonLd(schema: SchemaType): object {
  switch (schema.type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: schema.name,
        url: schema.url,
        ...(schema.logo && { logo: schema.logo }),
      };

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: schema.name,
        url: schema.url,
        ...(schema.description && { description: schema.description }),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${schema.url}/home?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };

    case 'SoftwareApplication':
      return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: schema.name,
        applicationCategory: schema.applicationCategory,
        operatingSystem: schema.operatingSystem,
        ...(schema.description && { description: schema.description }),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      };

    case 'BreadcrumbList':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: schema.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    default:
      return {};
  }
}

/**
 * JsonLd component for adding structured data to pages
 * Supports Organization, WebSite, SoftwareApplication, and BreadcrumbList schemas
 */
export const JsonLd = ({ schema }: JsonLdProps) => {
  const jsonLd = generateJsonLd(schema);

  return (
    <Head>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
};

// Pre-configured schemas for common use cases
export const LudiscanOrganization: OrganizationSchema = {
  type: 'Organization',
  name: 'Ludiscan',
  url: baseUrl,
  logo: `${baseUrl}/favicon/favicon-96x96.png`,
};

export const LudiscanWebSite: WebSiteSchema = {
  type: 'WebSite',
  name: 'Ludiscan',
  url: baseUrl,
  description: 'Player position tracking and heatmap visualization tool for game analytics',
};

export const LudiscanApp: SoftwareApplicationSchema = {
  type: 'SoftwareApplication',
  name: 'Ludiscan',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  description: 'Game analytics platform with 2D/3D heatmap visualization and AI-powered insights',
};

/**
 * Create breadcrumb schema from path segments
 */
export const createBreadcrumbSchema = (items: BreadcrumbItem[]): BreadcrumbSchema => ({
  type: 'BreadcrumbList',
  items: items.map((item) => ({
    name: item.name,
    url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
  })),
});

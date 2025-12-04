/**
 * Dynamic Docs Page with Catch-all Routing
 * Safely handles docs pages in both dev and build environments
 */

/* eslint-disable import/order */
import styled from '@emotion/styled';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { FC } from 'react';

import type { DocPage } from '@src/utils/docs/types';

import { Text } from '@src/component/atoms/Text';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import { DocsContent } from '@src/features/docs/components/DocsContent';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';
import { getDocBySlug, getDocSlugs } from '@src/utils/docs/loader';
/* eslint-enable import/order */

interface DocsPageProps {
  currentDoc: DocPage | null;
  error?: string | null;
  className?: string;
}

/**
 * Docs page component
 * Displays documentation with sidebar navigation
 */
const Component: FC<DocsPageProps> = ({ currentDoc, error, className }) => {
  const router = useRouter();
  const { theme } = useSharedTheme();

  const handleBack = () => {
    router.back();
  };

  // Handle error state
  if (error) {
    return (
      <div className={className}>
        <DashboardBackgroundCanvas />
        <SidebarLayout />
        <InnerContent>
          <div className={`${className}__errorContainer`}>
            <Text text='Documentation Error' fontSize={theme.typography.fontSize['2xl']} color={theme.colors.semantic.error.main} />
            <Text text={error} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            <Text
              text='Please check that documentation files are properly set up in src/docs/ directory.'
              fontSize={theme.typography.fontSize.sm}
              color={theme.colors.text.secondary}
            />
          </div>
        </InnerContent>
      </div>
    );
  }

  return (
    <div className={className}>
      <DashboardBackgroundCanvas />
      <SidebarLayout />
      <InnerContent>
        <Header title='Documentation' onClick={handleBack} />
        <div className={`${className}__contentContainer`}>
          <DocsContent doc={currentDoc} />
        </div>
      </InnerContent>
    </div>
  );
};

const DocsPage = styled(Component)`
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__contentContainer {
    flex: 1;
    height: calc(100vh - 60px); /* Subtract header height for proper scrolling */
    padding: 24px 48px;
    overflow-y: auto;
  }

  &__errorContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
  }
`;

export default DocsPage;

/**
 * Generate static paths for all docs
 * Includes all valid documentation slugs
 */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const slugs = await getDocSlugs();

    // Generate paths for each slug
    const paths = slugs.map((slug) => ({
      params: { slug: slug.split('/') },
    }));

    // Also add root path
    paths.push({
      params: { slug: [] },
    });

    return {
      paths,
      fallback: 'blocking', // Use blocking fallback for new pages
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Docs] Error generating static paths:', error);

    // Return empty paths on error, fallback will handle requests
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

/**
 * Generate static props for docs pages
 * Loads the appropriate documentation content
 */
export const getStaticProps: GetStaticProps<DocsPageProps> = async ({ params }) => {
  try {
    // Get current doc slug
    const slug = params?.slug ? (params.slug as string[]).join('/') : '';

    let currentDoc: DocPage | null = null;

    // Load current doc if slug is provided
    if (slug) {
      currentDoc = await getDocBySlug(slug);

      if (!currentDoc) {
        // Return 404 if doc not found
        return {
          notFound: true,
          revalidate: 3600, // ISR: revalidate after 1 hour
        };
      }
    }

    return {
      props: {
        currentDoc,
        error: null,
      },
      revalidate: 3600, // ISR: revalidate every hour
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[Docs] Error generating static props:', errorMessage);

    return {
      props: {
        currentDoc: null,
        error: `Failed to load documentation: ${errorMessage}`,
      },
      revalidate: 60, // ISR: try again after 1 minute on error
    };
  }
};

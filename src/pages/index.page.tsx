import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import type { FC } from 'react';

import { MarkDownText } from '@src/component/molecules/MarkDownText';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import readmeRaw from '@src/files/heatmapReadme.md';
import { useAuth } from '@src/hooks/useAuth';
import { InnerContent } from '@src/pages/_app.page';
import { dimensions } from '@src/styles/style';

export type IndexPageProps = {
  className?: string;
  readme?: string;
};

export async function getServerSideProps() {
  try {
    return { props: { readme: readmeRaw } };
  } catch {
    return {
      notFound: true,
    };
  }
}

const Component: FC<IndexPageProps> = ({ className, readme }) => {
  const router = useRouter();
  const { isAuthorized, ready } = useAuth();

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    // When user is authorized, redirect to home
    if (ready && isAuthorized) {
      router.push('/home');
    }
  }, [isAuthorized, ready, router]);

  return (
    <div className={className}>
      {isAuthorized && <SidebarLayout />}
      <InnerContent showSidebar={isAuthorized}>
        <Header title={'Ludiscan'} onClick={handleBackClick} />
        <div className={`${className}__inner`}>
          {!isAuthorized && ready ? (
            <div className={`${className}__content`}>
              <div className={`${className}__welcome`}>
                <h1 className={`${className}__title`}>Welcome to Ludiscan</h1>
                <p className={`${className}__subtitle`}>Visualize gameplay data with 3D and 2D heatmaps</p>
                <div className={`${className}__buttons`}>
                  <Link href={'/login'}>Sign In</Link>
                </div>
              </div>
              {readme && <MarkDownText className={`${className}__markdown`} markdown={readme} />}
            </div>
          ) : (
            <div className={`${className}__loading`}>Loading...</div>
          )}
        </div>
      </InnerContent>
    </div>
  );
};

const IndexPage = styled(Component)`
  height: 100vh;

  &__inner {
    display: flex;
    flex-direction: column;
    height: calc(100vh - ${dimensions.headerHeight}px - 60px);
    padding: 2rem;
    text-align: center;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100%;
  }

  &__welcome {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  &__title {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary.main};
  }

  &__subtitle {
    margin: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.8;
  }

  &__buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;

    a {
      text-decoration: none;
    }
  }

  &__markdown {
    flex: 1;
    width: 100%;
    max-width: ${dimensions.maxWidth}px;
    margin: 0 auto;
    overflow-y: auto;
    font-size: 1rem;
    line-height: 1.6;
    text-align: start;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default function App(props: IndexPageProps) {
  return <IndexPage {...props} />;
}

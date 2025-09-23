import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { FC } from 'react';

import { MarkDownText } from '@src/component/molecules/MarkDownText';
import { Header } from '@src/component/templates/Header';
import { SidebarLayout } from '@src/component/templates/SidebarLayout';
import readmeRaw from '@src/files/heatmapReadme.md';
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
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);
  return (
    <div className={className}>
      <SidebarLayout />
      <InnerContent>
        <Header title={'Index Page'} onClick={handleBackClick} />
        <div className={`${className}__inner`}>
          <Link href={'/home'}>
            <span>Go to Home</span>
          </Link>
          {readme && <MarkDownText className={`${className}__markdown`} markdown={readme} />}
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

  &__markdown {
    flex: 1;
    max-width: ${dimensions.maxWidth}px;
    margin: 0 auto;
    overflow-y: auto;
    font-size: 1.2rem;
    line-height: 1.6;
    text-align: start;
  }

  &__logo {
    height: 6em;
    padding: 1.5em;
    transition: filter 300ms;
    will-change: filter;
  }

  &__logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }

  &__logo.react:hover {
    filter: drop-shadow(0 0 2em #61dafbaa);
  }

  @keyframes logo-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    a:nth-of-type(2) &__logo {
      animation: logo-spin infinite 20s linear;
    }
  }

  &__card {
    padding: 2em;
  }

  &__read-the-docs {
    color: #888;
  }
`;

export default function App(props: IndexPageProps) {
  return <IndexPage {...props} />;
}

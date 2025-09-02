import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { FC } from 'react';

import { Header } from '@src/component/templates/Header';
import readmeRaw from '@src/files/heatmapReadme.md';
import { dimensions } from '@src/styles/style';

export type IndexPageProps = {
  className?: string;
  readme?: string;
};

export async function getServerSideProps() {
  try {
    return { props: { title: 'Index Page', readme: readmeRaw } };
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
      <Header title={'Index Page'} onClick={handleBackClick} />
      <div className={`${className}__inner`}>
        <Link href={'/home'}>
          <span>Go to Home</span>
        </Link>
        <div className={`${className}__markdown`}>
          <Markdown remarkPlugins={[remarkGfm]}>{readme}</Markdown>
        </div>
      </div>
    </div>
  );
};

const IndexPage = styled(Component)`
  height: 100vh;

  &__inner {
    padding: 2rem;
    text-align: center;
  }

  &__markdown {
    max-width: ${dimensions.maxWidth}px;
    margin: 0 auto;
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

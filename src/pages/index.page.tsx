import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';

export type IndexPageProps = {
  className?: string;
};

export async function getServerSideProps() {
  return {
    props: {
      title: 'Index Page',
    },
  };
}

const Component: FC<IndexPageProps> = ({ className }) => {
  const [count, setCount] = useState(0);
  return (
    <div className={className}>
      <h1>Index Page</h1>
      <Link href={'/home'}>
        <span>Go to Home</span>
      </Link>
      <div>
        <a href='https://vite.dev' target='_blank' rel='noreferrer'>
          <Image src={'/ludiscan/view/vite.svg'} className={`${className}__logo`} alt='Vite logo' width={120} height={120} />
        </a>
        <a href='https://react.dev' target='_blank' rel='noreferrer'>
          <Image src={'/ludiscan/view/react.svg'} className={`${className}__logo react`} alt='React logo' width={120} height={120} />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={`${className}__card`}>
        <Button onClick={() => setCount((count) => count + 1)} scheme={'surface'} fontSize={'medium'}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={`${className}__read-the-docs`}>Click on the Vite and React logos to learn more</p>
    </div>
  );
};

const IndexPage = styled(Component)`
  padding: 2rem;
  text-align: center;

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

export default function App() {
  return (
    <div>
      <IndexPage />
    </div>
  );
}

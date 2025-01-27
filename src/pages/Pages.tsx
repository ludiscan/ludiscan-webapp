import styled from '@emotion/styled';
import { Route, Routes } from 'react-router-dom';

import { HomePage } from './home/home.page.tsx';
import { IndexPage } from './index.page.tsx';

import type { FC } from 'react';
import type { RouteProps} from 'react-router-dom';

const PagesProps = [
  {
    path: '/home',
    Component: HomePage
  }
] as const satisfies RouteProps[];

const Components: FC = () => {
  return (
    <Routes>
      <Route index element={<IndexPage />} />
      {PagesProps.map((page) => (
        <Route key={page.path} path={page.path} element={<page.Component />} />
      ))}
    </Routes>
  );
};

export const Pages = styled(Components)`
`
;

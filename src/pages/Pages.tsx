import styled from '@emotion/styled';
import { Route, Routes } from 'react-router-dom';

import { PageRoutes } from '../modeles/paths';

import type { FC } from 'react';

export type PagesProps = {
  className?: string | undefined;
};

const Components: FC<PagesProps> = ({ className }) => {
  return (
    <div className={className}>
      <Routes>
        {PageRoutes.map((page) => (
          <Route key={page.path} path={page.path} element={<page.Component />} />
        ))}
      </Routes>
    </div>
  );
};

export const Pages = styled(Components)`
  min-width: 320px;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
`;

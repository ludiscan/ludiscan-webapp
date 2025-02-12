import styled from '@emotion/styled';
import { Route, Routes } from 'react-router-dom';

import { PageRoutes } from '../modeles/paths';

import type { FC } from 'react';

import { IndexPage } from '@/pages/index.page.tsx';
import { dimensions } from '@/styles/style.ts';

export type PagesProps = {
  className?: string | undefined;
};

const Components: FC<PagesProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className={`${className}__content`}>
        <Routes>
          <Route index element={<IndexPage />} />
          {PageRoutes.map((page) => (
            <Route key={page.path} path={page.path} element={<page.Component />} />
          ))}
        </Routes>
      </div>
    </div>
  );
};

export const Pages = styled(Components)`
  height: calc(100% - ${dimensions.headerHeight}px);
  margin: 0 auto;

  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    margin-left: ${dimensions.sidebarWidth}px;
  }

  &__content {
    min-width: 320px;
    max-width: 900px;
    padding: 16px;
    margin: 0 auto;
  }
`;

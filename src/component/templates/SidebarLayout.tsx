import styled from '@emotion/styled';
import Link from 'next/link';

import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';

export type SidebarLayoutProps = {
  className?: string | undefined;
};

const Component: FC<SidebarLayoutProps> = ({ className }) => {
  return (
    <ResponsiveSidebar>
      <div className={className}>
        <Link href={'/home'}>
          <Text text='Home' />
        </Link>
      </div>
    </ResponsiveSidebar>
  );
};

export const SidebarLayout = styled(Component)`
  display: flex;
`;

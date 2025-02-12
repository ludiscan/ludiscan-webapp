import styled from '@emotion/styled';

import type { FC } from 'react';

import { Text } from '@/component/atoms/Text.tsx';
import { ResponsiveSidebar } from '@/component/molecules/ResponsiveSidebar.tsx';
import { RouterNavLink } from '@/component/templates/RouterNavigate.tsx';

export type SidebarLayoutProps = {
  className?: string | undefined;
};

const Component: FC<SidebarLayoutProps> = ({ className }) => {
  return (
    <ResponsiveSidebar>
      <div className={className}>
        <RouterNavLink to={'home'}>
          <Text text='Home' />
        </RouterNavLink>
      </div>
    </ResponsiveSidebar>
  );
};

export const SidebarLayout = styled(Component)`
  display: flex;
`;

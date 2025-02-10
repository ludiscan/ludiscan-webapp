import styled from '@emotion/styled';

import type { FC } from 'react';

import { ResponsiveSidebar } from '@/component/molecules/ResponsiveSidebar.tsx';

export type SidebarProps = {
  className?: string | undefined;
};

const Component: FC<SidebarProps> = ({ className }) => {
  return (
    <ResponsiveSidebar>
      <div className={className} />
    </ResponsiveSidebar>
  );
};

export const Sidebar = styled(Component)``;

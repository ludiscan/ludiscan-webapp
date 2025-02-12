import styled from '@emotion/styled';
import { CiUser } from 'react-icons/ci';

import type { FC } from 'react';

import { Text } from '@/component/atoms/Text.tsx';
import { RouterNavLink } from '@/component/templates/RouterNavigate.tsx';
import { dimensions, fontSizes } from '@/styles/style.ts';

export type HeaderProps = {
  className?: string | undefined;
};

const Component: FC<HeaderProps> = ({ className }) => {
  return (
    <header className={className}>
      <Text text='Header' fontSize={fontSizes.largest} />
      <Text text='Header' fontSize={fontSizes.largest} />
      <RouterNavLink to={'/login'}>
        <CiUser size={24} />
      </RouterNavLink>
    </header>
  );
};

export const Header = styled(Component)`
  display: flex;
  height: ${dimensions.headerHeight}px;
  background-color: ${({ theme }) => theme.colors.surface.light};
  transition: margin-left 0.3s ease-in-out;

  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    margin-left: ${dimensions.sidebarWidth}px;
  }
`;

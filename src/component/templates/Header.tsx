import styled from '@emotion/styled';
import Link from 'next/link';
import { CiUser } from 'react-icons/ci';

import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { dimensions, fontSizes } from '@src/styles/style';

export type HeaderProps = {
  className?: string | undefined;
};

const Component: FC<HeaderProps> = ({ className }) => {
  return (
    <header className={className}>
      <Text text='Header' fontSize={fontSizes.largest} />
      <Text text='Header' fontSize={fontSizes.largest} />
      <Link href={'/login'}>
        <CiUser size={24} />
      </Link>
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

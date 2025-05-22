import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode, MouseEvent } from 'react';

import { ButtonHeight, Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { zIndexes } from '@src/styles/style';

export type EllipsisMenuProps = {
  className?: string | undefined;
  children: ReactNode;
  fontSize: ButtonProps['fontSize'];
  scheme: ButtonProps['scheme'];
};

const Component: FC<EllipsisMenuProps> = ({ className, children, scheme = 'surface', fontSize = 'medium' }) => {
  const { theme } = useSharedTheme();
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);
  const openMenu = useCallback(() => {
    setIsOpen(true);
  }, []);
  useEffect(() => {
    // 画面外タップで閉じる
    const handleClickOutside = () => {
      closeMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu]);
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    },
    [closeMenu, isOpen, openMenu],
  );
  return (
    <>
      <Button className={className} onClick={handleClick} scheme={scheme} fontSize={fontSize} radius={'default'} width={'fit-content'}>
        <IoEllipsisHorizontal />
      </Button>
      <Card
        className={`${className}__menuContent ${isOpen ? 'open' : ''}`}
        shadow={'medium'}
        border={theme.colors.border.light}
        padding={'8px'}
        stopPropagate={true}
      >
        {children}
      </Card>
    </>
  );
};

export const EllipsisMenu = styled(Component)`
  position: relative;

  &__menuContent {
    position: absolute;
    top: ${(props) => (ButtonHeight(props) === 'fit-content' ? '20px' : `calc(${ButtonHeight(props)} + 12px)`)};
    left: 0;
    z-index: ${zIndexes.dropdown};
    display: none;

    &.open {
      display: block;
    }
  }
`;

import styled from '@emotion/styled';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { StyledComponent } from '@emotion/styled';
import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode, MouseEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { zIndexes } from '@src/styles/style';

export type EllipsisMenuProps = Pick<ButtonProps, 'fontSize' | 'scheme'> & {
  className?: string | undefined;
  children: ReactNode;
  onClick?: ButtonProps['onClick'];
};

export const EllipsisMenuContext = createContext<{ isOpen: boolean }>({ isOpen: false });

export const useEllipsisMenuContext = () => useContext(EllipsisMenuContext);

const Component: FC<EllipsisMenuProps> = ({ className, children, scheme = 'surface', fontSize = 'medium', onClick }) => {
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
      if (onClick) {
        onClick(event);
      }
    },
    [closeMenu, isOpen, onClick, openMenu],
  );
  return (
    <>
      <Button className={className} onClick={handleClick} scheme={scheme} fontSize={fontSize} radius={'default'} width={'fit-content'}>
        <IoEllipsisHorizontal />
      </Button>
      <EllipsisMenuContext.Provider value={{ isOpen }}>{children}</EllipsisMenuContext.Provider>
    </>
  );
};

export type EllipsisMenuContentProps = {
  className?: string | undefined;
  children: ReactNode;
};

const ContentRowComponent: FC<EllipsisMenuContentProps> = ({ className, children }) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  return (
    <Card className={`${className} ${isOpen ? 'open' : ''}`} shadow={'medium'} border={theme.colors.border.light} padding={'8px'} stopPropagate={true}>
      <InlineFlexRow align={'center'} gap={8}>
        {children}
      </InlineFlexRow>
    </Card>
  );
};

const ContentColumnComponent: FC<EllipsisMenuContentProps> = ({ className, children }) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  return (
    <Card className={`${className} ${isOpen ? 'open' : ''}`} shadow={'medium'} border={theme.colors.border.light} padding={'8px'} stopPropagate={true}>
      <InlineFlexColumn align={'flex-start'} gap={8}>
        {children}
      </InlineFlexColumn>
    </Card>
  );
};

const ContentRow = styled(ContentRowComponent)`
  position: absolute;
  left: 0;
  z-index: ${zIndexes.dropdown};
  display: none;

  &.open {
    display: block;
  }
`;

const ContentColumn = styled(ContentColumnComponent)`
  position: absolute;
  left: 0;
  z-index: ${zIndexes.dropdown};
  display: none;

  &.open {
    display: block;
  }
`;

type EllipsisMenuType = StyledComponent<EllipsisMenuProps> & {
  ContentRow: typeof ContentRow;
  ContentColumn: typeof ContentColumn;
};

export const EllipsisMenu = styled(Component)`
  position: relative;
` as EllipsisMenuType;
EllipsisMenu.ContentRow = ContentRow;
EllipsisMenu.ContentColumn = ContentColumn;

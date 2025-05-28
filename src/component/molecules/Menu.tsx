import styled from '@emotion/styled';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { StyledComponent } from '@emotion/styled';
import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode, MouseEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { zIndexes } from '@src/styles/style';

export type MenuProps = Pick<ButtonProps, 'fontSize' | 'scheme'> & {
  className?: string | undefined;
  icon: ReactNode;
  children: ReactNode;
  onClick?: ButtonProps['onClick'];
};

export const EllipsisMenuContext = createContext<{ isOpen: boolean }>({ isOpen: false });

export const useEllipsisMenuContext = () => useContext(EllipsisMenuContext);

const Component: FC<MenuProps> = ({ className, icon, children, scheme = 'surface', fontSize = 'medium', onClick }) => {
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
    <div className={className}>
      <Button onClick={handleClick} scheme={scheme} fontSize={fontSize} radius={'default'} width={'fit-content'}>
        {icon}
      </Button>
      <EllipsisMenuContext.Provider value={{ isOpen }}>{children}</EllipsisMenuContext.Provider>
    </div>
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
      <FlexRow align={'center'} gap={8} wrap={'nowrap'}>
        {children}
      </FlexRow>
    </Card>
  );
};

const ContentColumnComponent: FC<EllipsisMenuContentProps> = ({ className, children }) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  return (
    <Card className={`${className} ${isOpen ? 'open' : ''}`} shadow={'medium'} border={theme.colors.border.light} padding={'8px'} stopPropagate={true}>
      <FlexColumn align={'flex-start'} gap={8} wrap={'nowrap'}>
        {children}
      </FlexColumn>
    </Card>
  );
};

const ContentRow = styled(ContentRowComponent)`
  position: absolute;
  z-index: ${zIndexes.dropdown};
  display: none;

  &.open {
    display: block;
  }
`;

const ContentColumn = styled(ContentColumnComponent)`
  position: absolute;
  z-index: ${zIndexes.dropdown};
  display: none;

  &.open {
    display: block;
  }
`;

type EllipsisMenuType = StyledComponent<MenuProps> & {
  ContentRow: typeof ContentRow;
  ContentColumn: typeof ContentColumn;
};

export const Menu = styled(Component)`
  position: relative;
` as EllipsisMenuType;
Menu.ContentRow = ContentRow;
Menu.ContentColumn = ContentColumn;

export const EllipsisMenu: FC<Exclude<MenuProps, 'icon'>> = (props) => {
  return <Menu {...props} icon={<IoEllipsisHorizontal />} />;
};

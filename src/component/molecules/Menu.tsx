import styled from '@emotion/styled';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { StyledComponent } from '@emotion/styled';
import type { ButtonProps } from '@src/component/atoms/Button';
import type { CardProps } from '@src/component/atoms/Card';
import type { FC, ReactNode, MouseEvent } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { zIndexes } from '@src/styles/style';

export type MenuProps = Omit<ButtonProps, 'onClick'> & {
  className?: string | undefined;
  icon: ReactNode;
  children: ReactNode;
  onClick?: ButtonProps['onClick'];
};

export const EllipsisMenuContext = createContext<{ isOpen: boolean; onClose: () => void }>({ isOpen: false, onClose: () => {} });

export const useEllipsisMenuContext = () => useContext(EllipsisMenuContext);

const Component: FC<MenuProps> = (props) => {
  const { className, icon, children, onClick } = props;
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
      <Button {...props} onClick={handleClick}>
        {icon}
      </Button>
      <EllipsisMenuContext.Provider value={{ isOpen, onClose: closeMenu }}>{children}</EllipsisMenuContext.Provider>
    </div>
  );
};

export type EllipsisMenuContentProps = CardProps & {
  className?: string | undefined;
  align?: 'left' | 'right';
  gap?: number;
  children: ReactNode;
};

const ContentRowComponent: FC<EllipsisMenuContentProps> = (props) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  const { className, gap, children, shadow = 'medium', border = theme.colors.border.light, padding = '8px', stopPropagate = true } = props;
  return (
    <Card {...props} className={`${className} ${isOpen ? 'open' : ''}`} shadow={shadow} border={border} padding={padding} stopPropagate={stopPropagate}>
      <FlexRow align={'center'} gap={gap} wrap={'nowrap'}>
        {children}
      </FlexRow>
    </Card>
  );
};

const ContentColumnComponent: FC<EllipsisMenuContentProps> = (props) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  const { className, gap, children, shadow = 'medium', border = theme.colors.border.light, padding = '8px', stopPropagate = true } = props;
  return (
    <Card {...props} className={`${className} ${isOpen ? 'open' : ''}`} shadow={shadow} border={border} padding={padding} stopPropagate={stopPropagate}>
      <FlexColumn align={'flex-start'} gap={gap} wrap={'nowrap'}>
        {children}
      </FlexColumn>
    </Card>
  );
};

const ContentButton: FC<ButtonProps> = (props) => {
  const { onClick } = props;
  const { onClose } = useEllipsisMenuContext();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      if (onClick) {
        onClick(event);
      }
      onClose();
    },
    [onClose, onClick],
  );
  return <Button {...props} onClick={handleClick} />;
};

const ContentRow = styled(ContentRowComponent)`
  position: absolute;
  ${({ align }) => (align === 'left' ? 'left: 0;' : 'right: 0;')}
  z-index: ${zIndexes.dropdown};
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;

  &.open {
    visibility: visible;
    opacity: 1;
  }
`;

const ContentColumn = styled(ContentColumnComponent)`
  position: absolute;
  ${({ align }) => (align === 'left' ? 'left: 0;' : 'right: 0;')}
  z-index: ${zIndexes.dropdown};
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;

  &.open {
    visibility: visible;
    opacity: 1;
  }
`;

type EllipsisMenuType = StyledComponent<MenuProps> & {
  ContentRow: typeof ContentRow;
  ContentColumn: typeof ContentColumn;
  ContentButton: typeof ContentButton;
};

export const Menu = styled(Component)`
  position: relative;
` as EllipsisMenuType;
Menu.ContentRow = ContentRow;
Menu.ContentColumn = ContentColumn;
Menu.ContentButton = ContentButton;

export const EllipsisMenu: FC<Omit<MenuProps, 'icon'>> = (props) => {
  return <Menu {...props} icon={<IoEllipsisHorizontal />} />;
};

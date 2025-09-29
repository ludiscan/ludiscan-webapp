import styled from '@emotion/styled';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { StyledComponent } from '@emotion/styled';
import type { ButtonProps } from '@src/component/atoms/Button';
import type { CardProps } from '@src/component/atoms/Card';
import type { LabeledButtonProps } from '@src/component/atoms/LabeledButton';
import type { FC, ReactNode, MouseEvent, RefObject } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { LabeledButton } from '@src/component/atoms/LabeledButton';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { zIndexes } from '@src/styles/style';

export type MenuProps = Omit<LabeledButtonProps, 'onClick'> & {
  className?: string | undefined;
  icon: ReactNode;
  children: ReactNode;
  onClick?: ButtonProps['onClick'];
};

const EllipsisMenuContext = createContext<{ isOpen: boolean; onClose: () => void; anchorRef: RefObject<HTMLDivElement | null> }>({
  isOpen: false,
  onClose: () => {},
  anchorRef: { current: null },
});

const useEllipsisMenuContext = () => useContext(EllipsisMenuContext);

type FloatingProps = {
  className?: string;
  children: ReactNode;
  align?: 'left' | 'right';
  placement?: 'top' | 'bottom';
  offset?: number;
  openClassName?: string; // "open"
};

const Floating: FC<FloatingProps> = ({ className, children, align = 'left', placement = 'bottom', offset = 8, openClassName = 'open' }) => {
  const { isOpen, anchorRef } = useEllipsisMenuContext();
  const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', visibility: 'hidden' });

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const base: React.CSSProperties = { position: 'fixed', zIndex: zIndexes.dropdown };
    const left = align === 'left' ? rect.left : undefined;
    const right = align === 'right' ? window.innerWidth - rect.right : undefined;

    // bottom: rect.bottom + offset で下へ、top: rect.top - offset & translateY(-100%) で上へ
    if (placement === 'bottom') {
      setStyle({ ...base, top: rect.bottom + offset, left, right });
    } else {
      setStyle({ ...base, top: rect.top - offset, left, right, transform: 'translateY(-100%)' });
    }
  }, [anchorRef, align, placement, offset]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    update();
    const onScroll = () => update();
    const onResize = () => update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, update]);

  const content = (
    <div className={`${className} ${isOpen ? openClassName : ''}`} style={style}>
      {children}
    </div>
  );
  return createPortal(content, document.body);
};

const Component: FC<MenuProps> = (props) => {
  const { className, icon, children, onClick } = props;
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
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
    <div className={className} ref={anchorRef}>
      <LabeledButton {...props} onClick={handleClick}>
        {icon}
      </LabeledButton>
      <EllipsisMenuContext.Provider value={{ isOpen, onClose: closeMenu, anchorRef }}>{children}</EllipsisMenuContext.Provider>
    </div>
  );
};

export type EllipsisMenuContentProps = CardProps & {
  className?: string | undefined;
  align?: 'left' | 'right';
  gap?: number;
  placement?: 'top' | 'bottom';
  children: ReactNode;
};

const ContentRowComponent: FC<EllipsisMenuContentProps> = (props) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  const { className, gap, children, shadow = 'medium', border = theme.colors.border.light, padding = '8px', stopPropagate = true } = props;
  return (
    <Floating className={`${className} ${isOpen ? 'open' : ''}`} align={props.align} placement={props['placement'] || 'bottom'}>
      <Card {...props} className={`${className} ${isOpen ? 'open' : ''}`} shadow={shadow} border={border} padding={padding} stopPropagate={stopPropagate}>
        <FlexRow align={'center'} gap={gap} wrap={'nowrap'}>
          {children}
        </FlexRow>
      </Card>
    </Floating>
  );
};

const ContentColumnComponent: FC<EllipsisMenuContentProps> = (props) => {
  const { theme } = useSharedTheme();
  const { isOpen } = useEllipsisMenuContext();
  const { className, gap, children, shadow = 'medium', border = theme.colors.border.light, padding = '8px', stopPropagate = true } = props;
  return (
    <Floating className={`${className} ${isOpen ? 'open' : ''}`} align={props.align} placement={props['placement'] || 'bottom'}>
      <Card {...props} className={`${className} ${isOpen ? 'open' : ''}`} shadow={shadow} border={border} padding={padding} stopPropagate={stopPropagate}>
        <FlexColumn align={'flex-start'} gap={gap} wrap={'nowrap'}>
          {children}
        </FlexColumn>
      </Card>
    </Floating>
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
  visibility: hidden;
  opacity: 0;
  transition: 0.3s;

  &.open {
    visibility: visible;
    opacity: 1;
  }
`;

const ContentColumn = styled(ContentColumnComponent)`
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

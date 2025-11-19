/**
 * ResponsiveSidebar.tsx
 *
 * モバイル環境で自動的に折りたたまれ、トグルボタンで横からスライド表示／非表示を切り替えるサイドバーのサンプル実装です。
 * 詳細なスタイルや画面サイズの閾値等は必要に応じてご調整ください。
 */

import styled from '@emotion/styled';
import { useState, useEffect, useCallback } from 'react';
import { RiMenu2Fill, RiMenu3Fill } from 'react-icons/ri';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { dimensions, zIndexes } from '@src/styles/style';

export type ResponsiveSidebarProps = {
  /** 外部からスタイルを上書きするための className（必要に応じてご利用ください） */
  className?: string;
  /** サイドバー内に表示する内容。指定がなければデフォルトで「Sidebar」と表示します。 */
  children: ReactNode;

  onChange?: (isOpen: boolean) => void;
};
/**
 * トグルボタンのスタイルコンポーネント
 *
 * ・position: fixed により画面上部左側に配置
 * ・モバイル環境でのみ表示するため、@media クエリでデスクトップでは非表示にしています
 */
const ToggleButtonComponent = ({ className, onClick, isOpen }: { className?: string; onClick: () => void; isOpen: boolean }) => {
  const { theme } = useSharedTheme();
  return (
    <FlexRow className={`${className} ${isOpen ? '' : 'closed'}`} align={'center'}>
      <Button className={`${className}__button`} onClick={onClick} scheme={'none'} fontSize={'base'} width={'full'}>
        {isOpen ? <RiMenu3Fill size={28} color={theme.colors.text.primary} /> : <RiMenu2Fill size={28} color={theme.colors.text.primary} />}
      </Button>
    </FlexRow>
  );
};
const ToggleButton = styled(ToggleButtonComponent)`
  /* Fixed positioning to stay visible when sidebar is closed */
  position: fixed;
  inset-block-start: var(--spacing-md); /* 16px from top */

  /* Use logical properties (Design Implementation Guide Rule 4) */
  inset-inline-start: 0; /* Start from left edge */
  z-index: ${zIndexes.sidebar + 1};

  /* Ensure minimum touch target size (Design Guide Rule 10) */
  inline-size: 56px; /* Increased from 46px to accommodate touch target */
  block-size: 44px; /* Increased from 32px for WCAG 2.2 SC 2.5.8 */
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
  box-shadow: 2px 0 4px rgb(0 0 0 / 20%);
  transition: all 0.25s ease-in-out;

  &.closed {
    /* When closed, button is at left edge */
    inset-inline-start: 0;
  }

  &:not(.closed) {
    /* When open, button moves with sidebar */
    inset-inline-start: ${dimensions.sidebarWidth}px;
  }

  &__button {
    inline-size: 100%;
    block-size: 100%;
  }

  /* Hide toggle button on desktop */
  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    display: none;
  }
`;

const Component: FC<ResponsiveSidebarProps> = ({ className, children, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= dimensions.mobileWidth) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (onChange && isOpen !== undefined) {
      onChange(isOpen);
    }
  }, [isOpen, onChange]);

  /**
   * トグルボタンのクリックイベントハンドラ
   * ・クリック時に isOpen の状態を反転させ、SidebarWrapper の transform を変更
   */
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return isOpen !== undefined ? (
    <>
      <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
      <div className={`${className} ${isOpen ? 'visible' : ''}`}>{children}</div>
    </>
  ) : null;
};

export const ResponsiveSidebar = styled(Component)`
  position: fixed;

  /* Use logical properties for positioning (Design Implementation Guide Rule 4) */
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: ${zIndexes.sidebar};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  /* Use logical properties for sizing */
  inline-size: ${dimensions.sidebarWidth}px;
  block-size: 100vh;

  /* Use logical properties for padding */
  padding-block: var(--spacing-md);
  padding-inline: var(--spacing-md);
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface.base};
  box-shadow: 0 2px 4px rgb(0 0 0 / 30%);

  /* RTL/LTR aware transform */
  transform: translateX(-100%);
  transition: transform 0.4s ease-in-out;

  &.visible {
    transform: translateX(0);
  }

  /* Smooth scrolling for accessibility */
  scroll-behavior: smooth;

  /* Custom scrollbar styling for webkit browsers */
  &::-webkit-scrollbar {
    inline-size: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface.base};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.interactive};
    }
  }
`;

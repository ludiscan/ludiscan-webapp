/**
 * ResponsiveSidebar.tsx
 *
 * モバイル環境で自動的に折りたたまれ、トグルボタンで横からスライド表示／非表示を切り替えるサイドバーのサンプル実装です。
 * 詳細なスタイルや画面サイズの閾値等は必要に応じてご調整ください。
 */

import styled from '@emotion/styled';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { RiMenu2Fill, RiMenu3Fill } from 'react-icons/ri';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { PanelCard } from '@src/component/atoms/Card';
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

export type ToggleButtonProps = {
  className?: string;
  onClick: ButtonProps['onClick'];
  isOpen: boolean;
};
/**
 * トグルボタンのスタイルコンポーネント
 *
 * ・position: fixed により画面上部左側に配置
 * ・モバイル環境でのみ表示するため、@media クエリでデスクトップでは非表示にしています
 */
const ToggleButtonComponent: FC<ToggleButtonProps> = ({ className, onClick, isOpen }) => {
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
  pointer-events: auto; /* Enable click events (parent FixedWrapper has pointer-events: none) */
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
  box-shadow: 2px 0 4px rgb(0 0 0 / 20%);
  transition: all 0.3s ease-in-out;

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

/** position: fixedだけを担当する親ラッパー */
const FixedWrapper = styled.div`
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: ${zIndexes.sidebar};
  pointer-events: none;
`;

/** コンテンツ用のスタイル（backdrop-filter, transformなど） */
const SidebarContent = styled(PanelCard)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  /* Use logical properties for sizing */
  inline-size: calc(${dimensions.sidebarWidth}px - 6px);
  block-size: calc(100vh - var(--spacing-xs) * 2);

  /* Use logical properties for padding */
  padding-block: var(--spacing-md);
  padding-inline: var(--spacing-sm);
  margin: var(--spacing-xs);
  overflow-y: auto;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);

  /* RTL/LTR aware transform */
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;

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

type SidebarContentProps = {
  className?: string;
  children: ReactNode;
  isOpen: boolean;
  toggleSidebar: () => void;
  surfaceColor: string;
};

const SidebarPortalContent: FC<SidebarContentProps> = ({ className, children, isOpen, toggleSidebar, surfaceColor }) => {
  return (
    <FixedWrapper>
      <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
      <SidebarContent className={`${className} ${isOpen ? 'visible' : ''}`} color={surfaceColor}>
        {children}
      </SidebarContent>
    </FixedWrapper>
  );
};

export const ResponsiveSidebar: FC<ResponsiveSidebarProps> = ({ className, children, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const { theme } = useSharedTheme();

  // SSR対応: クライアントサイドでのみポータルを有効化
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // SSRまたは初期化前は何も表示しない
  if (!mounted || isOpen === undefined) {
    return null;
  }

  // ポータルを使ってbody直下にレンダリング（親要素のblur/transformの影響を回避）
  return createPortal(
    <SidebarPortalContent className={className} isOpen={isOpen} toggleSidebar={toggleSidebar} surfaceColor={theme.colors.surface.base}>
      {children}
    </SidebarPortalContent>,
    document.body,
  );
};

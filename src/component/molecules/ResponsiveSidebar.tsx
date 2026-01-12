/**
 * ResponsiveSidebar.tsx
 *
 * モバイル環境で自動的に折りたたまれ、外部からの制御で表示/非表示を切り替えるサイドバー
 * Headerのハンバーガーメニューと連携して動作する
 */

import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine } from 'react-icons/ri';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { PanelCard } from '@src/component/atoms/Card';
import { FlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { dimensions, zIndexes } from '@src/styles/style';

export type ResponsiveSidebarProps = {
  /** 外部からスタイルを上書きするための className */
  className?: string;
  /** サイドバー内に表示する内容 */
  children: ReactNode;
  /** サイドバーの開閉状態（外部制御） */
  isOpen: boolean;
  /** 閉じるボタンが押された時のコールバック */
  onClose: () => void;
};

/** position: fixedだけを担当する親ラッパー */
const FixedWrapper = styled.div`
  position: fixed;
  inset-block-start: 0;
  inset-inline-start: 0;
  z-index: ${zIndexes.sidebar};
  pointer-events: none;
`;

/** 閉じるボタンのコンテナ */
const CloseButtonWrapper = styled(FlexRow)`
  position: absolute;
  inset-block-start: var(--spacing-sm);
  inset-inline-end: var(--spacing-sm);
  z-index: 1;

  /* デスクトップでは非表示 */
  /* stylelint-disable-next-line media-query-no-invalid */
  @media (min-width: ${dimensions.mobileWidth}px) {
    display: none;
  }
`;

/** コンテンツ用のスタイル（backdrop-filter, transformなど） */
const SidebarContent = styled(PanelCard)`
  position: relative;
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

type SidebarPortalContentProps = {
  className?: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  surfaceColor: string;
};

const SidebarPortalContent: FC<SidebarPortalContentProps> = ({ className, children, isOpen, onClose, surfaceColor }) => {
  const { theme } = useSharedTheme();
  return (
    <FixedWrapper>
      <SidebarContent className={`${className} ${isOpen ? 'visible' : ''}`} color={surfaceColor}>
        <CloseButtonWrapper>
          <Button onClick={onClose} scheme={'none'} fontSize={'xl'} aria-label='メニューを閉じる'>
            <RiCloseLine size={24} color={theme.colors.text.primary} />
          </Button>
        </CloseButtonWrapper>
        {children}
      </SidebarContent>
    </FixedWrapper>
  );
};

export const ResponsiveSidebar: FC<ResponsiveSidebarProps> = ({ className, children, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useSharedTheme();

  // SSR対応: クライアントサイドでのみポータルを有効化
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSRまたは初期化前は何も表示しない
  if (!mounted) {
    return null;
  }

  // ポータルを使ってbody直下にレンダリング（親要素のblur/transformの影響を回避）
  return createPortal(
    <SidebarPortalContent className={className} isOpen={isOpen} onClose={onClose} surfaceColor={theme.colors.surface.base}>
      {children}
    </SidebarPortalContent>,
    document.body,
  );
};

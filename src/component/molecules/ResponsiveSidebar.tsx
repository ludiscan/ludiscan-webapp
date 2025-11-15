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
  position: relative;
  top: 2px;
  left: ${dimensions.sidebarWidth - 40}px;
  z-index: ${zIndexes.sidebar + 1};
  width: 46px;
  height: 32px;
  transform: translateX(-50%);
  transition: all 0.25s ease-in-out;

  &.closed {
    left: ${dimensions.sidebarWidth}px;
    background: ${({ theme }) => theme.colors.surface.base};
  }

  &__button {
    width: 100%;
  }

  /* デスクトップ環境ではトグルボタンを非表示にする */

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
    <div className={`${className} ${isOpen ? 'visible' : ''}`}>
      <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
      {children}
    </div>
  ) : null;
};

export const ResponsiveSidebar = styled(Component)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${zIndexes.sidebar};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: ${dimensions.sidebarWidth}px;
  height: 100vh;
  padding: 16px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface.base};
  box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  transform: translateX(-100%);
  transition: transform 0.4s ease-in-out;

  &.visible {
    transform: translateX(0);
  }

  /* Smooth scrolling */
  scroll-behavior: smooth;

  /* Custom scrollbar styling for webkit browsers */
  &::-webkit-scrollbar {
    width: 6px;
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

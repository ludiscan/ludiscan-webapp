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

import { Button } from '@/component/atoms/Button.tsx';
import { FlexRow } from '@/component/atoms/Flex.tsx';
import { useSharedTheme } from '@/hooks/useSharedTheme.tsx';
import { dimensions, zIndexes } from '@/styles/style.ts';

export type ResponsiveSidebarProps = {
  /** 外部からスタイルを上書きするための className（必要に応じてご利用ください） */
  className?: string;
  /** サイドバー内に表示する内容。指定がなければデフォルトで「Sidebar」と表示します。 */
  children: ReactNode;
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
      <Button className={`${className}__button`} onClick={onClick} scheme={'none'} fontSize={'medium'} width={'fit-content'}>
        {isOpen ? <RiMenu3Fill size={28} color={theme.colors.text} /> : <RiMenu2Fill size={28} color={theme.colors.text} />}
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
  border-radius: 0 8px 8px 0;
  transform: translateX(-50%);
  transition: all 0.25s ease-in-out;

  &.closed {
    left: ${dimensions.sidebarWidth}px;
    background: ${({ theme }) => theme.colors.surface.main};
    box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
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

const Component: FC<ResponsiveSidebarProps> = ({ className, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= dimensions.mobileWidth) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // 初回レンダリング時に画面サイズをチェック
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * トグルボタンのクリックイベントハンドラ
   * ・クリック時に isOpen の状態を反転させ、SidebarWrapper の transform を変更
   */
  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className={`${className} ${isOpen ? 'visible' : ''}`}>
      <ToggleButton onClick={toggleSidebar} isOpen={isOpen} />
      {children}
    </div>
  );
};

export const ResponsiveSidebar = styled(Component)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${zIndexes.sidebar};
  box-sizing: border-box;
  width: ${dimensions.sidebarWidth}px;
  height: 100%;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.surface.main};
  box-shadow: 0 2px 4px rgb(0 0 0 / 30%);
  transform: translateX(-100%);
  transition: transform 0.4s ease-in-out;

  &.visible {
    transform: translateX(0);
  }
`;

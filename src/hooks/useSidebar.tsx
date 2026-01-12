/**
 * useSidebar.tsx
 *
 * サイドバーの開閉状態を管理するContext
 * HeaderのハンバーガーメニューとResponsiveSidebarの連携に使用
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import type { FC, ReactNode } from 'react';

import { dimensions } from '@src/styles/style';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  /** モバイル幅の場合のみサイドバーを閉じる（メニュークリック時用） */
  closeIfMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // ウィンドウサイズに応じた初期状態とリサイズ対応
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= dimensions.mobileWidth) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // 初期化
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closeIfMobile = useCallback(() => {
    if (window.innerWidth < dimensions.mobileWidth) {
      setIsOpen(false);
    }
  }, []);

  return <SidebarContext.Provider value={{ isOpen, toggle, open, close, closeIfMobile }}>{children}</SidebarContext.Provider>;
};

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

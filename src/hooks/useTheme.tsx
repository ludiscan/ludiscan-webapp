'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import darkTheme from '../styles/dark.ts';
import lightTheme from '../styles/light.ts';

import type { Theme } from '@emotion/react';
import type { FC, ReactNode} from 'react';

export type ThemeName = 'light' | 'dark';

// コンテキストの型
interface SharedThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setupTheme: (themeName: ThemeName) => void;
}

export const SharedThemeContext = createContext<SharedThemeContextType | undefined>(undefined);

export const SharedThemeProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => currentTheme === lightTheme ? darkTheme : lightTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupTheme = useCallback((themeName: ThemeName) => {
    if (themeName === 'light') {
      setTheme(lightTheme);
    } else {
      setTheme(darkTheme);
    }
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setupTheme }), [setupTheme, theme, toggleTheme]);

  return (
    <SharedThemeContext.Provider value={value}>
      {children}
    </SharedThemeContext.Provider>
  );
};

// 基本アプリ内ではuseThemeSwitcherを使ってthemeの呼び出しを行う
export const useSharedTheme = (): SharedThemeContextType => {
  const context = useContext(SharedThemeContext);
  if (!context) {
    throw new Error('useSharedTheme must be used within a SharedThemeProvider');
  }
  return context;
};

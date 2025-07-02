'use client';

import { ThemeProvider } from '@emotion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import darkTheme from '../styles/dark';
import lightTheme from '../styles/light';

import type { Theme } from '@emotion/react';
import type { FC, ReactNode } from 'react';

import { getThemeName, saveThemeName } from '@src/utils/localstrage';

export type ThemeName = 'light' | 'dark';

// コンテキストの型
interface SharedThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setupTheme: (themeName: ThemeName) => void;
}

export const SharedThemeContext = createContext<SharedThemeContextType | undefined>(undefined);
export type SharedThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

export const SharedThemeProvider: FC<SharedThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState(initialTheme || lightTheme);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === lightTheme ? darkTheme : lightTheme));
  }, []);

  const setupTheme = useCallback((themeName: ThemeName) => {
    if (themeName === 'light') {
      setTheme(lightTheme);
    } else {
      setTheme(darkTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = initialTheme ?? (getThemeName() === 'dark' ? darkTheme : lightTheme);
    if (updateTheme !== undefined) {
      setTheme(updateTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    const savedTheme = getThemeName();
    const name = theme === lightTheme ? 'light' : 'dark';
    if (savedTheme != name && !initialTheme) {
      saveThemeName(name);
    }
  }, [initialTheme, theme]);

  const value = useMemo(() => ({ theme, toggleTheme, setupTheme }), [setupTheme, theme, toggleTheme]);

  return (
    <SharedThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
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

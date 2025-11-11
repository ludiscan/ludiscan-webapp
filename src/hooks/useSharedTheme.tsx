'use client';

import { ThemeProvider } from '@emotion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Theme } from '@emotion/react';
import type { ThemeType } from '@src/modeles/theme';
import type { FC, ReactNode } from 'react';

import themes, { toggleTheme } from '@src/modeles/theme';
import { getThemeName, getThemeType, saveThemeName, saveThemeType } from '@src/utils/localstrage';

// コンテキストの型
interface SharedThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
}

export const SharedThemeContext = createContext<SharedThemeContextType | undefined>(undefined);
export type SharedThemeProviderProps = {
  children: ReactNode;
  initialTheme?: Theme;
};

export const SharedThemeProvider: FC<SharedThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState(initialTheme || themes.crimsonDusk.dark);
  const [themeType, setThemeTypeState] = useState<ThemeType>('crimsonDusk');

  const onToggleTheme = useCallback(() => {
    setTheme((currentTheme) => toggleTheme(currentTheme));
  }, []);

  const onSetThemeType = useCallback(
    (type: ThemeType) => {
      setThemeTypeState(type);
      const newTheme = themes[type][theme.mode];
      if (newTheme !== undefined) {
        setTheme(newTheme);
      }
    },
    [theme],
  );

  useEffect(() => {
    const savedType = getThemeType() || 'crimsonDusk';
    setThemeTypeState(savedType);
    const updateTheme = initialTheme ?? themes[savedType][getThemeName() || 'dark'];
    if (updateTheme !== undefined) {
      setTheme(updateTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    const savedTheme = getThemeName();
    const savedThemeType = getThemeType();
    const name = theme.mode;
    if (savedTheme != name && !initialTheme) {
      saveThemeName(name);
    }
    if (savedThemeType != themeType && !initialTheme) {
      saveThemeType(themeType);
    }
  }, [initialTheme, theme, themeType]);

  const value = useMemo(
    () => ({ theme, themeType, toggleTheme: onToggleTheme, setThemeType: onSetThemeType }),
    [theme, themeType, onToggleTheme, onSetThemeType],
  );

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

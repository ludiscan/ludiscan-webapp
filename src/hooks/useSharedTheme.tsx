'use client';

import { ThemeProvider } from '@emotion/react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { Theme } from '@emotion/react';
import type { ThemeType } from '@src/modeles/theme';
import type { FC, ReactNode } from 'react';

import themes, { toggleTheme } from '@src/modeles/theme';
import { getThemeName, getThemeType, saveThemeName, saveThemeType } from '@src/utils/localstrage';

/**
 * Recursively converts a theme object to CSS custom properties
 * @param obj - The object to convert (e.g., theme.colors)
 * @param prefix - The CSS variable prefix (e.g., '--theme-colors')
 * @returns An object mapping CSS variable names to their values
 */
function objectToCssVars(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const cssVarName = prefix ? `${prefix}-${key}` : `--theme-${key}`;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively handle nested objects
      Object.assign(result, objectToCssVars(value as Record<string, unknown>, cssVarName));
    } else if (typeof value === 'string' || typeof value === 'number') {
      // Convert to CSS variable
      result[cssVarName] = String(value);
    }
  }

  return result;
}

/**
 * Applies theme colors as CSS custom properties to the document root
 * @param theme - The theme object containing colors and other properties
 */
function applyThemeToCssVars(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const cssVars = objectToCssVars({
    colors: theme.colors,
    spacing: theme.spacing,
    shadows: theme.shadows,
    borders: theme.borders,
  });

  // Apply all CSS variables to :root
  for (const [varName, value] of Object.entries(cssVars)) {
    root.style.setProperty(varName, value);
  }

  // Add data attribute for mode (light/dark) for CSS selectors
  root.setAttribute('data-theme-mode', theme.mode);
}

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

  // Apply theme as CSS custom properties whenever theme changes
  useEffect(() => {
    applyThemeToCssVars(theme);
  }, [theme]);

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

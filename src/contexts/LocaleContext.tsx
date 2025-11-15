/**
 * Locale Context
 * Provides locale management and translation functions throughout the app
 */

import React, { createContext, useCallback, useMemo, useState } from 'react';

import type { SupportedLocale, LocaleContextValue } from '@src/types/locale';

import { en } from '@src/locales/en';
import { ja } from '@src/locales/ja';

const translations = {
  ja,
  en,
} as const;

// Default locale from browser or fallback to Japanese
const getDefaultLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') return 'ja';

  const storedLocale = localStorage.getItem('ludiscan-locale') as SupportedLocale | null;
  if (storedLocale && (storedLocale === 'ja' || storedLocale === 'en')) {
    return storedLocale;
  }

  // Detect from browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  return 'en';
};

export const LocaleContext = createContext<LocaleContextValue>({
  locale: 'ja',
  setLocale: () => {},
  t: (key: string) => key,
});

interface LocaleProviderProps {
  children: React.ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>(getDefaultLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ludiscan-locale', newLocale);
    }
  }, []);

  /**
   * Translation function
   * Supports nested keys using dot notation: t('home.title')
   */
  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: unknown = translations[locale];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Translation key not found: ${key} for locale: ${locale}`);
          return key;
        }
      }

      return typeof value === 'string' ? value : key;
    },
    [locale],
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

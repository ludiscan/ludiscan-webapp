/**
 * useLocale hook
 * Provides access to locale context for translations
 */

import { useContext } from 'react';
import { LocaleContext } from '@src/contexts/LocaleContext';

/**
 * Hook to access locale functionality
 * @returns {object} Locale context with current locale, setLocale function, and translation function
 *
 * @example
 * const { locale, setLocale, t } = useLocale();
 *
 * // Get translation
 * const title = t('home.title');
 *
 * // Change locale
 * setLocale('en');
 */
export const useLocale = () => {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }

  return context;
};

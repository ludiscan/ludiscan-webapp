/**
 * Locale types and definitions
 */

export type SupportedLocale = 'ja' | 'en';

export interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
}

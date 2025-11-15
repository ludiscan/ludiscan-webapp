/**
 * Language Selector Component
 * Allows users to switch between supported languages
 */

import styled from '@emotion/styled';
import { useLocale } from '@src/hooks/useLocale';
import type { SupportedLocale } from '@src/types/locale';

const SelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const LanguageButton = styled.button<{ isActive: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.border)};
  border-radius: 4px;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.primary : 'transparent')};
  color: ${({ theme, isActive }) => (isActive ? '#fff' : theme.colors.text.primary)};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.background.hover)};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className }) => {
  const { locale, setLocale } = useLocale();

  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
  };

  return (
    <SelectorContainer className={className}>
      <LanguageButton isActive={locale === 'ja'} onClick={() => handleLocaleChange('ja')} type="button" aria-label="日本語">
        日本語
      </LanguageButton>
      <LanguageButton isActive={locale === 'en'} onClick={() => handleLocaleChange('en')} type="button" aria-label="English">
        English
      </LanguageButton>
    </SelectorContainer>
  );
};

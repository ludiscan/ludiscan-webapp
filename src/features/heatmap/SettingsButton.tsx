import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useState } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';

import type { ThemeType } from '@src/modeles/theme';
import type { SupportedLocale } from '@src/types/locale';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

const THEME_OPTIONS: { value: ThemeType; label: string }[] = [
  { value: 'slateEmber', label: 'Slate Ember' },
  { value: 'obsidianNight', label: 'Obsidian Night' },
  { value: 'oceanAbyss', label: 'Ocean Abyss' },
  { value: 'midnightSapphire', label: 'Midnight Sapphire' },
  { value: 'nordicNight', label: 'Nordic Night' },
  { value: 'crimsonDusk', label: 'Crimson Dusk' },
];

type SettingsButtonProps = {
  className?: string;
};

const Component: FC<SettingsButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const { theme, themeType, setThemeType, toggleTheme } = useSharedTheme();

  const handleLocaleChange = useCallback(
    (newLocale: SupportedLocale) => {
      setLocale(newLocale);
    },
    [setLocale],
  );

  const handleThemeTypeChange = useCallback(
    (newThemeType: ThemeType) => {
      setThemeType(newThemeType);
    },
    [setThemeType],
  );

  const handleModeToggle = useCallback(
    (targetMode: 'light' | 'dark') => {
      if (theme.mode !== targetMode) {
        toggleTheme();
      }
    },
    [theme.mode, toggleTheme],
  );

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = () => setOpen(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={className} role='group' aria-label='Settings'>
      <Button
        className='settings-trigger'
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup='menu'
        scheme='surface'
        fontSize='base'
        aria-label={t('heatmap.settings.title')}
      >
        <IoSettingsOutline size={18} />
      </Button>

      {open && (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className='settings-popover' onClick={(e) => e.stopPropagation()}>
          <div className='settings-header'>{t('heatmap.settings.title')}</div>

          {/* Language Section */}
          <div className='settings-section'>
            <div className='settings-label'>{t('heatmap.settings.language')}</div>
            <div className='settings-button-group'>
              <button
                type='button'
                className={`settings-option ${locale === 'ja' ? 'active' : ''}`}
                onClick={() => handleLocaleChange('ja')}
                aria-pressed={locale === 'ja'}
              >
                日本語
              </button>
              <button
                type='button'
                className={`settings-option ${locale === 'en' ? 'active' : ''}`}
                onClick={() => handleLocaleChange('en')}
                aria-pressed={locale === 'en'}
              >
                English
              </button>
            </div>
          </div>

          <div className='settings-divider' />

          {/* Theme Section */}
          <div className='settings-section'>
            <div className='settings-label'>{t('heatmap.settings.theme')}</div>
            <select className='settings-select' value={themeType} onChange={(e) => handleThemeTypeChange(e.target.value as ThemeType)}>
              {THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className='settings-divider' />

          {/* Mode Section */}
          <div className='settings-section'>
            <div className='settings-label'>{t('heatmap.settings.themeMode')}</div>
            <div className='settings-button-group'>
              <button
                type='button'
                className={`settings-option ${theme.mode === 'light' ? 'active' : ''}`}
                onClick={() => handleModeToggle('light')}
                aria-pressed={theme.mode === 'light'}
              >
                {t('heatmap.settings.light')}
              </button>
              <button
                type='button'
                className={`settings-option ${theme.mode === 'dark' ? 'active' : ''}`}
                onClick={() => handleModeToggle('dark')}
                aria-pressed={theme.mode === 'dark'}
              >
                {t('heatmap.settings.dark')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SettingsButton = memo(styled(Component)`
  position: relative;

  .settings-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    padding: 0;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 8px;
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  .settings-popover {
    position: absolute;
    bottom: 44px;
    left: 0;
    z-index: 10;
    min-width: 200px;
    padding: 12px;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 8px;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .settings-header {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .settings-section {
    margin-bottom: 8px;
  }

  .settings-label {
    margin-bottom: 6px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .settings-button-group {
    display: flex;
    gap: 4px;
  }

  .settings-option {
    flex: 1;
    padding: 6px 10px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.raised};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
    transition: all 0.15s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.sunken};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.contrast};
      background: ${({ theme }) => theme.colors.primary.main};
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  .settings-select {
    width: 100%;
    padding: 6px 8px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.raised};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  .settings-divider {
    height: 1px;
    margin: 10px 0;
    background: ${({ theme }) => theme.colors.border.default};
  }
`);

SettingsButton.displayName = 'SettingsButton';

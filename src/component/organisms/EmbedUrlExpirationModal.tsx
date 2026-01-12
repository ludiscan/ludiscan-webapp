import styled from '@emotion/styled';
import { useCallback, useState, useMemo, useRef } from 'react';
import { BiChevronDown, BiCopy, BiCheck } from 'react-icons/bi';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useToast } from '@src/component/templates/ToastContext';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

export type EmbedUrlExpirationModalProps = {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  sessionId: number;
  sessionName: string;
};

type PresetOption = '1h' | '4h' | '24h' | '7d' | 'custom';

const Component: FC<EmbedUrlExpirationModalProps> = ({ className, isOpen, onClose, projectId, sessionId, sessionName }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();
  const apiClient = useApiClient();

  const [selectedPreset, setSelectedPreset] = useState<PresetOption>('4h');
  const [customDateTime, setCustomDateTime] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Calculate min and max date for the input
  const { minDate, maxDate } = useMemo(() => {
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    // Format for date input (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      minDate: formatDate(now),
      maxDate: formatDate(oneYearFromNow),
    };
  }, []);

  // Validation logic
  const validateCustomDate = useCallback(
    (dateStr: string, preset: PresetOption): string | null => {
      if (preset !== 'custom') return null;
      if (!dateStr) return t('session.embedUrlValidationRequired');

      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of today

      const selected = new Date(dateStr);
      const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      if (selected < now) return t('session.embedUrlValidationFuture');
      if (selected > oneYearFromNow) return t('session.embedUrlValidationMaxYear');

      return null;
    },
    [t],
  );

  // Calculate hours from preset or custom date
  const calculateExpiresInHours = useCallback((): number => {
    if (selectedPreset === 'custom') {
      const now = new Date();
      const target = new Date(customDateTime);
      // Set target to end of selected day (23:59:59)
      target.setHours(23, 59, 59, 999);

      const diffMs = target.getTime() - now.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return Math.max(0.5, Math.min(8760, hours)); // Clamp to API limits
    }

    const presetHours: Record<Exclude<PresetOption, 'custom'>, number> = {
      '1h': 1,
      '4h': 4,
      '24h': 24,
      '7d': 168,
    };
    return presetHours[selectedPreset];
  }, [selectedPreset, customDateTime]);

  // Handle preset selection
  const handlePresetClick = useCallback((preset: PresetOption) => {
    setSelectedPreset(preset);
    setValidationError(null);
  }, []);

  // Handle custom date change
  const handleCustomDateChange = useCallback(
    (value: string) => {
      setCustomDateTime(value);
      if (selectedPreset === 'custom') {
        const error = validateCustomDate(value, 'custom');
        setValidationError(error);
      }
    },
    [selectedPreset, validateCustomDate],
  );

  // Clipboard copy with fallback for mobile browsers
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // Fall through to fallback
        }
      }

      // Fallback: use hidden input and execCommand
      try {
        const input = urlInputRef.current;
        if (input) {
          input.select();
          input.setSelectionRange(0, text.length); // For mobile
          const success = document.execCommand('copy');
          if (success) return true;
        }
      } catch {
        // Fall through
      }

      return false;
    },
    [],
  );

  // Copy the generated URL
  const handleCopyUrl = useCallback(async () => {
    if (!generatedUrl) return;

    const success = await copyToClipboard(generatedUrl);
    if (success) {
      setIsCopied(true);
      showToast(t('session.embedUrlCopied'), 2, 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      showToast(t('session.embedUrlCopyFallback'), 3, 'info');
    }
  }, [generatedUrl, copyToClipboard, showToast, t]);

  // Generate embed URL (without auto-copy)
  const handleGenerate = useCallback(async () => {
    const error = validateCustomDate(customDateTime, selectedPreset);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsGenerating(true);
    try {
      const expiresInHours = calculateExpiresInHours();
      const { data, error } = await apiClient.POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/embed-url', {
        params: {
          path: {
            project_id: projectId,
            session_id: sessionId,
          },
        },
        body: {
          expiresInHours,
        },
      });

      if (error) {
        showToast(t('session.embedUrlFailed'), 3, 'error');
        return;
      }

      // Show URL in modal instead of auto-copying (mobile-friendly)
      setGeneratedUrl(data.url);
    } catch {
      showToast(t('session.embedUrlFailed'), 3, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [customDateTime, selectedPreset, validateCustomDate, calculateExpiresInHours, apiClient, projectId, sessionId, showToast, t]);

  const handleClose = useCallback(() => {
    if (!isGenerating) {
      setSelectedPreset('4h');
      setCustomDateTime('');
      setValidationError(null);
      setGeneratedUrl(null);
      setIsCopied(false);
      onClose();
    }
  }, [isGenerating, onClose]);

  return (
    <Modal className={className} isOpen={isOpen} onClose={handleClose} title={t('session.embedUrlModalTitle')} closeOutside={!isGenerating}>
      <FlexColumn gap={16} className={`${className}__form`}>
        <VerticalSpacer size={8} />

        {/* Session Name */}
        <FlexColumn gap={4}>
          <Text text={t('session.embedUrlSessionLabel')} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
          <Text text={sessionName} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
        </FlexColumn>

        <VerticalSpacer size={4} />

        {generatedUrl ? (
          <>
            {/* Generated URL Display */}
            <FlexColumn gap={8}>
              <Text text={t('session.embedUrlGeneratedLabel')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />
              <div className={`${className}__urlContainer`}>
                <input
                  ref={urlInputRef}
                  type='text'
                  value={generatedUrl}
                  readOnly
                  className={`${className}__urlInput`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button type='button' onClick={handleCopyUrl} className={`${className}__copyButton ${isCopied ? 'copied' : ''}`} aria-label={t('session.embedUrlCopyButton')}>
                  {isCopied ? <BiCheck size={20} /> : <BiCopy size={20} />}
                </button>
              </div>
              <Text text={t('session.embedUrlCopyHint')} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.tertiary} />
            </FlexColumn>

            <VerticalSpacer size={8} />

            {/* Done Button */}
            <FlexRow gap={12} align={'flex-end'}>
              <Button onClick={handleClose} scheme={'primary'} fontSize={'base'}>
                {t('common.done')}
              </Button>
            </FlexRow>
          </>
        ) : (
          <>
            {/* Expiration Dropdown */}
            <FlexColumn gap={8}>
              <Text text={t('session.embedUrlExpirationLabel')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={'bold'} />

              <div className={`${className}__selectWrapper`}>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetClick(e.target.value as PresetOption)}
                  disabled={isGenerating}
                  className={`${className}__select`}
                >
                  <option value='1h'>{t('session.embedUrlPreset1h')}</option>
                  <option value='4h'>{t('session.embedUrlPreset4h')}</option>
                  <option value='24h'>{t('session.embedUrlPreset24h')}</option>
                  <option value='7d'>{t('session.embedUrlPreset7d')}</option>
                  <option value='custom'>{t('session.embedUrlCustomLabel')}</option>
                </select>
                <BiChevronDown size={16} className={`${className}__selectChevron`} />
              </div>

              {/* Custom Date Picker (only shown when Custom is selected) */}
              {selectedPreset === 'custom' && (
                <FlexColumn gap={8}>
                  <Text text={t('session.embedUrlCustomHelper')} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.tertiary} />
                  <div className={`${className}__customInputWrapper`}>
                    <input
                      type='date'
                      value={customDateTime}
                      onChange={(e) => handleCustomDateChange(e.target.value)}
                      min={minDate}
                      max={maxDate}
                      className={`${className}__customInput ${validationError ? 'error' : ''}`}
                      disabled={isGenerating}
                      aria-describedby={validationError ? `${className}__error` : undefined}
                    />
                  </div>
                  {validationError && (
                    <div id={`${className}__error`}>
                      <Text text={validationError} fontSize={theme.typography.fontSize.sm} color={theme.colors.semantic.error.main} />
                    </div>
                  )}
                </FlexColumn>
              )}
            </FlexColumn>

            <VerticalSpacer size={8} />

            {/* Action Buttons */}
            <FlexRow gap={12} align={'flex-end'}>
              <Button onClick={handleClose} scheme={'surface'} fontSize={'base'} disabled={isGenerating}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleGenerate} scheme={'primary'} fontSize={'base'} disabled={isGenerating || (selectedPreset === 'custom' && !!validationError)}>
                {isGenerating ? t('session.embedUrlGenerating') : t('session.embedUrlGenerate')}
              </Button>
            </FlexRow>
          </>
        )}
      </FlexColumn>
    </Modal>
  );
};

export const EmbedUrlExpirationModal = styled(Component)`
  &__form {
    width: 500px;
    max-width: 90vw;
  }

  &__selectWrapper {
    position: relative;
    width: 100%;
  }

  &__select {
    width: 100%;
    padding: 10px 36px 10px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    appearance: none;
    cursor: pointer;
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    option {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.base};
    }
  }

  &__selectChevron {
    position: absolute;
    top: 50%;
    right: 12px;
    color: ${({ theme }) => theme.colors.text.tertiary};
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__customInputWrapper {
    width: 100%;
  }

  &__customInput {
    width: 100%;
    padding: 10px 12px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    outline: none;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:focus {
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &.error {
      border-color: ${({ theme }) => theme.colors.semantic.error.main};
    }

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      filter: ${({ theme }) => (theme.mode === 'dark' ? 'invert(1)' : 'none')};
    }
  }

  &__urlContainer {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  &__urlInput {
    flex: 1;
    min-width: 0;
    padding: 10px 12px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    word-break: break-all;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary.main}80;
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}1a;
    }
  }

  &__copyButton {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: ${({ theme }) => theme.colors.text.secondary};
    cursor: pointer;
    background: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borders.radius.md};
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.hover};
      border-color: ${({ theme }) => theme.colors.border.strong};
    }

    &:active {
      transform: scale(0.95);
    }

    &.copied {
      color: ${({ theme }) => theme.colors.semantic.success.main};
      background: ${({ theme }) => theme.colors.semantic.success.main}15;
      border-color: ${({ theme }) => theme.colors.semantic.success.main}40;
    }
  }
`;

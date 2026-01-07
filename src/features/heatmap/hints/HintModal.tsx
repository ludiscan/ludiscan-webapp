import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';
import { IoBulbOutline } from 'react-icons/io5';

import type { HintDefinition } from './types';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { en } from '@src/locales/en';
import { ja } from '@src/locales/ja';

const translations = { ja, en } as const;

export type HintModalProps = {
  className?: string;
  isOpen: boolean;
  hint: HintDefinition | null;
  onClose: (dontShowAgain: boolean) => void;
};

const Component: FC<HintModalProps> = ({ className, isOpen, hint, onClose }) => {
  const { theme } = useSharedTheme();
  const { locale, t } = useLocale();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = useCallback(() => {
    onClose(dontShowAgain);
    setDontShowAgain(false);
  }, [dontShowAgain, onClose]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(e.target.checked);
  }, []);

  // Get localized content using dot notation keys
  const getNestedValue = useCallback(
    (path: string): unknown => {
      const currentTranslations = translations[locale];
      return path.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, currentTranslations);
    },
    [locale],
  );

  const { title, description, tips } = useMemo(() => {
    if (!hint) return { title: undefined, description: undefined, tips: undefined };
    return {
      title: getNestedValue(hint.titleKey) as string | undefined,
      description: getNestedValue(hint.descriptionKey) as string | undefined,
      tips: hint.tipsKey ? (getNestedValue(hint.tipsKey) as string[] | undefined) : undefined,
    };
  }, [hint, getNestedValue]);

  if (!hint) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOutside={true} title={title}>
      <FlexColumn className={className} gap={16}>
        <FlexRow className={`${className}__descriptionRow`} gap={12} align='flex-start'>
          <IoBulbOutline size={24} color={theme.colors.primary.main} />
          <Text text={description ?? ''} fontSize={theme.typography.fontSize.base} color={theme.colors.text.secondary} />
        </FlexRow>

        {tips && tips.length > 0 && (
          <FlexColumn className={`${className}__tipsContainer`} gap={8}>
            {tips.map((tip, index) => (
              <FlexRow key={index} className={`${className}__tipRow`} gap={8} align='flex-start'>
                <Text className={`${className}__tipBullet`} text='•' fontSize={theme.typography.fontSize.base} color={theme.colors.primary.main} />
                <Text text={tip} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
              </FlexRow>
            ))}
          </FlexColumn>
        )}

        <FlexRow className={`${className}__footer`} gap={16} align='center'>
          <label className={`${className}__checkboxLabel`}>
            <input type='checkbox' checked={dontShowAgain} onChange={handleCheckboxChange} className={`${className}__checkbox`} />
            <Text text={t('hints.dontShowAgain')} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.tertiary} />
          </label>

          <Button scheme='primary' fontSize='base' onClick={handleClose}>
            {t('hints.gotIt')}
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  );
};

export const HintModal = styled(Component)`
  width: 100%;
  min-width: 320px;
  max-width: 480px;
  padding-top: ${({ theme }) => theme.spacing.md};

  &__descriptionRow {
    padding: ${({ theme }) => theme.spacing.sm};
    background-color: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.md};
  }

  &__tipsContainer {
    padding: ${({ theme }) => theme.spacing.sm};
    padding-left: ${({ theme }) => theme.spacing.lg};
  }

  &__tipRow {
    line-height: 1.4;
  }

  &__tipBullet {
    flex-shrink: 0;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding-top: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  &__checkboxLabel {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    align-items: center;
    cursor: pointer;
  }

  &__checkbox {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
  }
`;

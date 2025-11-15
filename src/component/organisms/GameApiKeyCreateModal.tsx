import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { BiCopy, BiCheck } from 'react-icons/bi';

import type { CreateGameApiKeyResponse } from '@src/types/api-keys';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type GameApiKeyCreateModalProps = {
  className?: string;
  isOpen: boolean;
  newKeyName: string;
  isCreatingKey?: boolean;
  createdApiKey?: CreateGameApiKeyResponse | null;
  onClose: () => void;
  onKeyNameChange: (value: string) => void;
  onCreateKey: () => Promise<void>;
};

const Component: FC<GameApiKeyCreateModalProps> = ({
  className,
  isOpen,
  newKeyName,
  isCreatingKey = false,
  createdApiKey,
  onClose,
  onKeyNameChange,
  onCreateKey,
}) => {
  const { theme } = useSharedTheme();
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      await onCreateKey();
    } finally {
      setIsCreating(false);
    }
  }, [onCreateKey]);

  const handleCopy = useCallback(async () => {
    if (!createdApiKey?.apiKey) return;
    try {
      await navigator.clipboard.writeText(createdApiKey.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy:', err);
    }
  }, [createdApiKey]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Create API Key'>
      <div className={`${className}__modal`}>
        <FlexColumn gap={16}>
          {!createdApiKey ? (
            <>
              <div>
                <Text text='Key Name' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
                <VerticalSpacer size={8} />
                <OutlinedTextField
                  value={newKeyName}
                  onChange={onKeyNameChange}
                  placeholder='e.g., Production API Key'
                  fontSize={theme.typography.fontSize.base}
                  disabled={isCreating || isCreatingKey}
                />
              </div>

              <FlexRow gap={8} className={`${className}__buttonRow`}>
                <Button onClick={onClose} scheme='none' fontSize={'sm'} disabled={isCreating || isCreatingKey}>
                  <Text text='Cancel' fontSize={theme.typography.fontSize.sm} />
                </Button>
                <Button onClick={handleCreate} scheme='primary' fontSize={'sm'} disabled={isCreating || isCreatingKey}>
                  <Text text={isCreating || isCreatingKey ? 'Creating...' : 'Create'} fontSize={theme.typography.fontSize.sm} />
                </Button>
              </FlexRow>
            </>
          ) : (
            <>
              <div className={`${className}__successMessage`}>
                <Text text='API Key created successfully!' fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
                <VerticalSpacer size={8} />
                <Text
                  text="Make sure to copy your API key now. You won't be able to see it again!"
                  fontSize={theme.typography.fontSize.sm}
                  color={theme.colors.semantic.warning.main}
                />
              </div>

              <div className={`${className}__apiKeyContainer`}>
                <Text text='Your API Key' fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.bold} />
                <VerticalSpacer size={8} />
                <FlexRow gap={8} align='center' className={`${className}__apiKeyRow`}>
                  <OutlinedTextField value={createdApiKey.apiKey} onChange={() => {}} fontSize={theme.typography.fontSize.sm} disabled />
                  <Button onClick={handleCopy} scheme='surface' fontSize={'sm'} title='Copy to clipboard'>
                    {copied ? <BiCheck size={18} /> : <BiCopy size={18} />}
                  </Button>
                </FlexRow>
              </div>

              <FlexRow gap={8} className={`${className}__buttonRow`}>
                <Button onClick={onClose} scheme='primary' fontSize={'sm'}>
                  <Text text='Done' fontSize={theme.typography.fontSize.sm} />
                </Button>
              </FlexRow>
            </>
          )}
        </FlexColumn>
      </div>
    </Modal>
  );
};

export const GameApiKeyCreateModal = styled(Component)`
  &__modal {
    padding: 16px;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__successMessage {
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.surface.raised};
    border-radius: 4px;
  }

  &__apiKeyContainer {
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.surface.sunken};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 4px;
  }

  &__apiKeyRow {
    align-items: stretch;
  }
`;

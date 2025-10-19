import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';

export type GameApiKeyCreateModalProps = {
  className?: string;
  isOpen: boolean;
  newKeyName: string;
  isCreatingKey?: boolean;
  onClose: () => void;
  onKeyNameChange: (value: string) => void;
  onCreateKey: () => Promise<void>;
};

const Component: FC<GameApiKeyCreateModalProps> = ({ className, isOpen, newKeyName, isCreatingKey = false, onClose, onKeyNameChange, onCreateKey }) => {
  const { theme } = useSharedTheme();

  const handleCreate = useCallback(async () => {
    await onCreateKey();
  }, [onCreateKey]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Create API Key'>
      <div className={`${className}__modal`}>
        <FlexColumn gap={16}>
          <div>
            <Text text='Key Name' fontSize={fontSizes.small} color={theme.colors.text} fontWeight={fontWeights.bold} />
            <VerticalSpacer size={8} />
            <OutlinedTextField value={newKeyName} onChange={onKeyNameChange} placeholder='e.g., Production API Key' fontSize={fontSizes.medium} />
          </div>

          <FlexRow gap={8} className={`${className}__buttonRow`}>
            <Button onClick={onClose} scheme='none' fontSize='small' disabled={isCreatingKey}>
              <Text text='Cancel' fontSize={fontSizes.small} />
            </Button>
            <Button onClick={handleCreate} scheme='primary' fontSize='small' disabled={isCreatingKey}>
              <Text text={isCreatingKey ? 'Creating...' : 'Create'} fontSize={fontSizes.small} />
            </Button>
          </FlexRow>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export const GameApiKeyCreateModal = styled(Component)`
  &__modal {
    padding: 16px;
    color: ${({ theme }) => theme.colors.text};
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }
`;

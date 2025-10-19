import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { GameApiKey } from '@src/types/api-keys';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export type GameApiKeyDeleteConfirmModalProps = {
  className?: string;
  isOpen: boolean;
  selectedKey: GameApiKey | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
};

const Component: FC<GameApiKeyDeleteConfirmModalProps> = ({ className, isOpen, selectedKey, isDeleting = false, onClose, onConfirmDelete }) => {
  const { theme } = useSharedTheme();

  const handleDelete = useCallback(async () => {
    await onConfirmDelete();
  }, [onConfirmDelete]);

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Delete API Key'>
      <div className={`${className}__modal`}>
        <FlexColumn gap={16}>
          <Text text={`API-key "${selectedKey?.name}" を削除してよろしいですか？`} fontSize={fontSizes.medium} color={theme.colors.text} />
          <Text text='削除されたAPI-keyは二度と使用できなくなります。' fontSize={fontSizes.small} color={theme.colors.secondary.main} fontWeight='lighter' />
          <FlexRow gap={8} className={`${className}__buttonRow`}>
            <Button onClick={handleClose} scheme='none' fontSize='small' disabled={isDeleting}>
              <Text text='Cancel' fontSize={fontSizes.small} />
            </Button>
            <Button onClick={handleDelete} scheme='primary' fontSize='small' disabled={isDeleting}>
              <Text text={isDeleting ? 'Deleting...' : 'Delete'} fontSize={fontSizes.small} />
            </Button>
          </FlexRow>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export const GameApiKeyDeleteConfirmModal = styled(Component)`
  &__modal {
    padding: 16px;
    color: ${({ theme }) => theme.colors.text};
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }
`;

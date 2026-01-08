import styled from '@emotion/styled';
import { useCallback } from 'react';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SessionDeleteConfirmModalProps = {
  className?: string;
  isOpen: boolean;
  session: Session | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
};

const Component: FC<SessionDeleteConfirmModalProps> = ({ className, isOpen, session, isDeleting = false, onClose, onConfirmDelete }) => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();

  const handleDelete = useCallback(async () => {
    await onConfirmDelete();
  }, [onConfirmDelete]);

  const handleClose = useCallback(() => {
    if (!isDeleting) {
      onClose();
    }
  }, [isDeleting, onClose]);

  const confirmMessage = session ? t('sessionDelete.confirmMessage').replace('{name}', session.name) : '';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('sessionDelete.title')}>
      <div className={`${className}__modal`}>
        <FlexColumn gap={16}>
          <Text text={confirmMessage} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
          <Text text={t('sessionDelete.warning')} fontSize={theme.typography.fontSize.sm} color={theme.colors.semantic.error.main} fontWeight='lighter' />
          <FlexRow gap={8} className={`${className}__buttonRow`}>
            <Button onClick={handleClose} scheme='none' fontSize={'sm'} disabled={isDeleting}>
              <Text text={t('common.cancel')} fontSize={theme.typography.fontSize.sm} />
            </Button>
            <Button onClick={handleDelete} scheme='error' fontSize={'sm'} disabled={isDeleting}>
              <Text text={isDeleting ? t('common.processing') : t('common.delete')} fontSize={theme.typography.fontSize.sm} />
            </Button>
          </FlexRow>
        </FlexColumn>
      </div>
    </Modal>
  );
};

export const SessionDeleteConfirmModal = styled(Component)`
  &__modal {
    padding: 16px;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__buttonRow {
    justify-content: flex-end;
    margin-top: 16px;
  }
`;

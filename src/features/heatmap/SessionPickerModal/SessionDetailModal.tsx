import { memo, useCallback } from 'react';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { Modal } from '@src/component/molecules/Modal';
import { SessionDetail } from '@src/features/heatmap/SessionPickerModal/SessionDetail';

export type SessionDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
};

const Component: FC<SessionDetailModalProps> = ({ isOpen, onClose, session }) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Session Details'
      closeOutside
      style={{
        width: 'fit-content',
        minWidth: '400px',
        maxWidth: '90vw',
        padding: 0,
      }}
    >
      <SessionDetail session={session} />
    </Modal>
  );
};

export const SessionDetailModal = memo(Component);

SessionDetailModal.displayName = 'SessionDetailModal';

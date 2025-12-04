import styled from '@emotion/styled';
import { IoCloseOutline } from 'react-icons/io5';
import ReactModal, { defaultStyles } from 'react-modal';

import { Divider } from '../atoms/Divider';
import { FlexColumn, FlexRow } from '../atoms/Flex';
import { Text } from '../atoms/Text';

import type { Theme } from '@emotion/react';
import type { ReactNode } from 'react';
import type { Styles } from 'react-modal';

import { Button } from '@src/component/atoms/Button';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { hexToRGBA, zIndexes } from '@src/styles/style';

export type ModalProps = {
  className?: string | undefined;
  isOpen: boolean;
  title?: string | undefined;
  closeOutside?: boolean | undefined;
  onClose?: (() => void | Promise<void>) | undefined;
  children: ReactNode;
  style?: Styles['content'];
};

function defaultStyle(theme: Theme): Styles {
  return {
    ...defaultStyles,
    overlay: {
      position: 'fixed',
      zIndex: zIndexes.modal,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgb(21 21 21 / 40%)',
      alignContent: 'center',
      transition: 'all 0.2s ease-in-out',
    },
    content: {
      zIndex: zIndexes.modal,
      margin: 'auto',
      inset: '0',
      overflowY: 'auto',
      boxSizing: 'border-box',
      width: 'fit-content',
      minWidth: '40%',
      maxWidth: '80%',
      maxHeight: '90vh',
      height: 'fit-content',
      position: 'relative',
      borderRadius: '8px',
      backgroundColor: hexToRGBA(theme.colors.surface.raised, 0.8),
      border: `1px solid ${theme.colors.border.strong}`,
      paddingTop: '12px',
      transition: 'all 0.2s ease-in-out',
      backdropFilter: 'blur(6px)',
    },
  };
}

const Component = ({ className, isOpen, onClose, children, title, closeOutside, style }: ModalProps) => {
  const { theme } = useSharedTheme();
  return (
    <ReactModal
      className={className}
      isOpen={isOpen}
      style={{ ...defaultStyle(theme), content: { ...defaultStyle(theme).content, ...style } } as Styles}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={closeOutside}
    >
      {(title || onClose) && (
        <FlexRow className={`${className}__header`} align={'center'} gap={8}>
          {title && (
            <Text text={title} fontSize={theme.typography.fontSize.lg} fontWeight={theme.typography.fontWeight.bold} color={theme.colors.text.primary} />
          )}
          {onClose && (
            <Button className={`${className}__closeButton`} onClick={onClose} scheme={'none'} fontSize={'base'}>
              <IoCloseOutline size={24} />
            </Button>
          )}
        </FlexRow>
      )}
      {title && <Divider orientation={'horizontal'} thickness={'2px'} />}
      <FlexColumn className={`${className}__innerContent`} align={'center'}>
        {children}
      </FlexColumn>
    </ReactModal>
  );
};

export const Modal = styled(Component)`
  z-index: ${zIndexes.modal};
  transition: all 0.5s ease-in-out;

  &__header {
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
  }

  &__innerContent {
    padding: 0 16px 16px;
  }

  &__closeButton {
    margin-left: auto;
  }
`;

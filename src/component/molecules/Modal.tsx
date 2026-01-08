import styled from '@emotion/styled';
import { IoCloseOutline } from 'react-icons/io5';
import ReactModal, { defaultStyles } from 'react-modal';

import { Divider } from '../atoms/Divider';
import { FlexColumn, FlexRow } from '../atoms/Flex';

import type { Theme } from '@emotion/react';
import type { ReactNode } from 'react';
import type { Styles } from 'react-modal';

import { Button } from '@src/component/atoms/Button';
import { useLocale } from '@src/hooks/useLocale';
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
      maxWidth: '95%',
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
  const { t } = useLocale();

  // Generate unique IDs for accessibility
  const titleId = title ? `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined;

  return (
    <ReactModal
      className={className}
      isOpen={isOpen}
      style={{ ...defaultStyle(theme), content: { ...defaultStyle(theme).content, ...style } } as Styles}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={closeOutside}
      // Accessibility props (ReactModal already handles focus trap)
      shouldFocusAfterRender={false}
      shouldReturnFocusAfterClose={true}
      shouldCloseOnEsc={true}
      aria={{
        labelledby: titleId,
        modal: true,
      }}
      role='dialog'
    >
      {(title || onClose) && (
        <FlexRow className={`${className}__header`} align={'center'} gap={8}>
          {title && (
            <h2 id={titleId} className={`${className}__title`}>
              {title}
            </h2>
          )}
          {onClose && (
            <Button className={`${className}__closeButton`} onClick={onClose} scheme={'none'} fontSize={'base'} aria-label={t('accessibility.closeDialog')}>
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

  &__title {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__innerContent {
    padding: 0 16px 16px;
  }

  &__closeButton {
    margin-inline-start: auto;
  }
`;

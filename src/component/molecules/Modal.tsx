import styled from '@emotion/styled';
import ReactModal, { defaultStyles } from 'react-modal';

import { useSharedTheme } from '../../hooks/useSharedTheme.tsx';
import { fontSizes, fontWeights, zIndexes } from '../../styles/style.ts';
import { Divider } from '../atoms/Divider.tsx';
import { FlexColumn } from '../atoms/Flex.tsx';
import { Text } from '../atoms/Text.tsx';

import type { Theme } from '@emotion/react';
import type { ReactNode } from 'react';
import type { Styles } from 'react-modal';

export type ModalProps = {
  className?: string | undefined;
  isOpen: boolean;
  title?: string | undefined;
  onClose?: (() => void | Promise<void>) | undefined;
  children: ReactNode;
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
      transition: 'all 0.5s ease-in-out',
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
      borderRadius: '8px',
      backgroundColor: theme.colors.surface.main,
      border: `1px solid ${theme.colors.border.main}`,
      paddingTop: '12px',
      transition: 'all 0.5s ease-in-out',
    },
  };
}

const Component = ({ className, isOpen, onClose, children, title }: ModalProps) => {
  const { theme } = useSharedTheme();
  return (
    <ReactModal className={className} isOpen={isOpen} style={defaultStyle(theme)} onRequestClose={onClose}>
      {title && (
        <FlexColumn align={'center'} gap={2}>
          <Text text={title} fontSize={fontSizes.large1} fontWeight={fontWeights.black} />
          <Divider orientation={'horizontal'} thickness={'2px'} />
        </FlexColumn>
      )}
      <FlexColumn className={`${className}__innerContent`} align={'center'}>
        {children}
      </FlexColumn>
    </ReactModal>
  );
};

export const Modal = styled(Component)`
  z-index: ${zIndexes.modal};
  transition: all 0.5s ease-in-out;

  &__innerContent {
    padding: 0 16px 16px;
  }
`;

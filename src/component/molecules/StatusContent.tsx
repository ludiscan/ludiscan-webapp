import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import type { FC, ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Modal } from '@src/component/molecules/Modal';

export type StatusContentProps = {
  className?: string | undefined;
  status: 'loading' | 'error' | 'success';
  errorMessage?: string | undefined;
  children?: ReactNode;
  onRetry?: () => void;
};

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgb(255 255 255 / 30%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Component: FC<StatusContentProps> = ({ className, status, errorMessage, children, onRetry }) => {
  switch (status) {
    case 'loading':
      return (
        <div className={className}>
          <div className={`${className}__content`}>
            <Spinner />
          </div>
        </div>
      );

    case 'error':
      return (
        <div className={className}>
          <Modal isOpen={true} title={errorMessage || 'An error occurred.'} closeOutside={false} style={{ minWidth: '300px' }}>
            {onRetry && (
              <Button onClick={onRetry} scheme={'primary'} fontSize={'large1'} width={'full'}>
                Retry
              </Button>
            )}
          </Modal>
        </div>
      );

    case 'success':
      return <>{children}</>;

    default:
      return null;
  }
};

export const StatusContent = styled(Component)`
  width: 100%;
  height: 100%;

  &__content {
    position: relative;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgb(0 0 0 / 40%);
  }
`;

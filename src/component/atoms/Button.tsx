import styled from '@emotion/styled';

import { Colors, fontSizes } from '../../styles';

import type { ReactNode } from 'react';

export type ButtonProps = {
  className: string | undefined;
  onClick: () => Promise<void> | void;
  scheme: 'primary' | 'surface' | 'warning' | 'none' | 'error';
  fontSize: 'small' | 'medium' | 'large';
  width?: 'full' | 'fit-content';
  children: ReactNode;
  disabled?: boolean | undefined;
};

const Component = ({
  className, onClick, scheme, children, disabled = false
}: ButtonProps) => {
  return (
    <button className={`${className} ${scheme}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export const Button = styled(Component)`
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${(props) => (props.fontSize === 'small' ? '16px' : props.fontSize === 'large' ? '22px' : '18px')};
  height: ${(props) => (props.fontSize === 'small' ? '32px' : props.fontSize === 'large' ? '44px' : '36px')};
  width: ${(props) => (props.width === 'full' ? '100%' : 'fit-content')};
  cursor: pointer;
  font-size: ${(props) => (props.fontSize === 'small' ? fontSizes.small : props.fontSize === 'large' ? fontSizes.large1 : fontSizes.medium)};
  font-weight: bold;
  transition: opacity 0.2s;
  padding: ${(props) => (props.fontSize === 'small' ? '0 16px' : props.fontSize === 'large' ? '0 22px' : '0 18px')};

  &:hover {
    opacity: 0.6;
  }

  &:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
  }

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${Colors.white};
  }

  &.surface {
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  &.warning {
    background-color: ${Colors.honey05};
    color: ${Colors.white};
  }

  &.none {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  &.error {
    background-color: ${Colors.error};
    color: ${Colors.white};
  }
`;

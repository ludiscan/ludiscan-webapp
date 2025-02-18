import styled from '@emotion/styled';

import { colors, fontSizes } from '../../styles/style';

import type { ReactNode } from 'react';

export type ButtonProps = {
  className?: string | undefined;
  onClick: () => Promise<void> | void;
  scheme: 'primary' | 'surface' | 'warning' | 'none' | 'error' | 'secondary';
  fontSize: 'small' | 'medium' | 'large';
  width?: 'full' | 'fit-content';
  children: ReactNode;
  disabled?: boolean | undefined;
};

const Component = ({ className, onClick, scheme, children, disabled = false }: ButtonProps) => {
  return (
    <button className={`${className} ${scheme}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export const Button = styled(Component)`
  width: ${(props) => (props.width === 'full' ? '100%' : 'fit-content')};
  height: ${(props) => (props.scheme === 'none' ? 'fit-content' : props.fontSize === 'small' ? '28px' : props.fontSize === 'large' ? '36px' : '32px')};
  padding: ${(props) => (props.scheme === 'none' ? '2px' : props.fontSize === 'small' ? '0 16px' : props.fontSize === 'large' ? '0 22px' : '0 18px')};
  font-size: ${(props) => (props.fontSize === 'small' ? fontSizes.small : props.fontSize === 'large' ? fontSizes.large1 : fontSizes.medium)};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  border: none;
  border-radius: ${(props) => (props.fontSize === 'small' ? '16px' : props.fontSize === 'large' ? '22px' : '18px')};
  transition: opacity 0.2s;

  &.primary {
    color: ${colors.white};
    background-color: ${({ theme }) => theme.colors.primary.main};
  }

  &.surface {
    background-color: ${({ theme }) => theme.colors.surface.main};
    border: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  &.warning {
    color: ${colors.white};
    background-color: ${colors.honey05};
  }

  &.none {
    color: ${({ theme }) => theme.colors.text};
    background-color: transparent;
    border: none;
  }

  &.error {
    color: ${colors.white};
    background-color: ${colors.error};
  }

  &.secondary {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.secondary.main};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
  }

  &:disabled {
    color: ${colors.white};
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.disabled};
  }

  &:hover &:not(:disabled) {
    opacity: 0.6;
  }
`;

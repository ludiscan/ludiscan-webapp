// atoms/Switch.tsx
import styled from '@emotion/styled';

import type { FC } from 'react';

export type SwitchProps = {
  className?: string;
  label: string;
  checked?: boolean | undefined;
  size: 'small' | 'medium' | 'large';
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const SwitchComponent: FC<SwitchProps> = ({ className, label, checked, size = 'medium', onChange, disabled = false }: SwitchProps) => {
  return (
    <label className={`${className} ${size}`} aria-label={label}>
      <input id={label ?? className} type='checkbox' checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className={`${className}__slider`} />
    </label>
  );
};

export const Switch = styled(SwitchComponent)`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  &.small {
    width: 40px;
    height: 20px;
  }

  &.medium {
    width: 50px;
    height: 24px;
  }

  &.large {
    width: 60px;
    height: 30px;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  &__slider {
    position: absolute;
    inset: 0;
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.secondary.light};
    border-radius: ${({ size }) => (size === 'small' ? '10px' : size === 'medium' ? '12px' : '14px')};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    transition: 0.4s;
  }

  input:checked + &__slider {
    background-color: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
  }

  &__slider::before {
    position: absolute;
    top: ${({ size }) => (size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px')};
    left: ${({ size }) => (size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px')};
    width: calc(${({ size }) => (size === 'small' ? '16px' : size === 'medium' ? '20px' : '24px')} - 4px);
    height: calc(${({ size }) => (size === 'small' ? '16px' : size === 'medium' ? '20px' : '24px')} - 4px);
    content: '';
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + &__slider::before {
    transform: ${({ size }) => (size === 'small' ? 'translateX(20px)' : size === 'medium' ? 'translateX(26px)' : 'translateX(32px)')};
  }

  &__slider:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

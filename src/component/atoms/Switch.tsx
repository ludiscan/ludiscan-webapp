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
      <span className={`${className}__slider ${disabled && 'disabled'}`} />
    </label>
  );
};

export const Switch = styled(SwitchComponent)`
  position: relative;
  display: inline-block;
  width: ${({ size }) => (size === 'small' ? '40px' : size === 'large' ? '60px' : '50px')};
  height: ${({ size }) => (size === 'small' ? '20px' : size === 'large' ? '30px' : '24px')};

  .disabled {
    cursor: not-allowed;
    opacity: 0.5;
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
    background-color: ${({ theme }) => theme.colors.surface.interactive};
    border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: ${({ theme }) => theme.borders.radius.full};
    transition: 0.4s;
  }

  input:checked + &__slider {
    background-color: ${({ theme }) => theme.colors.primary.main};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  input:focus + &__slider {
    outline: 2px solid ${({ theme }) => theme.colors.border.focus};
    outline-offset: 2px;
  }

  input:focus:not(:focus-visible) + &__slider {
    outline: none;
  }

  &__slider::before {
    position: absolute;
    top: ${({ theme }) => theme.borders.width.default};
    left: ${({ theme }) => theme.borders.width.default};
    width: calc(${({ size }) => (size === 'small' ? '16px' : size === 'large' ? '24px' : '20px')} - 2 * ${({ theme }) => theme.borders.width.default});
    height: calc(${({ size }) => (size === 'small' ? '16px' : size === 'large' ? '24px' : '20px')} - 2 * ${({ theme }) => theme.borders.width.default});
    content: '';
    background-color: ${({ theme }) => theme.colors.surface.base};
    border-radius: ${({ theme }) => theme.borders.radius.full};
    transition: 0.4s;
  }

  input:checked + &__slider::before {
    transform: ${({ size }) => (size === 'small' ? 'translateX(20px)' : size === 'large' ? 'translateX(30px)' : 'translateX(26px)')};
  }
`;

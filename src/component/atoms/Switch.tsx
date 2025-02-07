// atoms/Switch.tsx
import styled from '@emotion/styled';

import type { FC } from 'react';

export type SwitchProps = {
  className?: string;
  label: string;
  checked?: boolean | undefined;
  size?: 'small' | 'medium' | 'large';
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const SwitchComponent: FC<SwitchProps> = ({ className, label, checked, onChange, disabled = false }: SwitchProps) => {
  return (
    <label className={className} aria-label={label}>
      <input type='checkbox' checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className='slider' />
    </label>
  );
};

export const Switch = styled(SwitchComponent)`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    cursor: pointer;
    background-color: #ccc;
    border-radius: 24px;
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
  }

  .slider::before {
    position: absolute;
    bottom: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    content: '';
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }

  input:checked + .slider::before {
    transform: translateX(26px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

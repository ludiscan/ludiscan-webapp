// atoms/Switch.tsx
import styled from '@emotion/styled';

import type { FC } from 'react';

export type SwitchProps = {
  className?: string;
  'label': string;
  checked?: boolean | undefined;
  size?: 'small' | 'medium' | 'large';
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

const SwitchComponent: FC<SwitchProps> = ({
  className, label, checked, onChange, disabled = false
}: SwitchProps) => {
  return (
    <label className={className} aria-label={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider" />
    </label>
  );
};

export const Switch = styled(SwitchComponent)`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }

  input:checked + .slider {
    background-color: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

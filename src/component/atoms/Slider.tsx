// atoms/Slider.tsx
import styled from '@emotion/styled';

import type { ChangeEvent, FC } from 'react';

export type SliderProps = {
  className?: string;
  value?: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const SliderComponent: FC<SliderProps> = (args) => {
  const { className, value, onChange, min = 0, max = 100, step = 1, disabled = false } = args;
  return (
    <input
      {...args}
      type='range'
      className={className}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
      disabled={disabled}
    />
  );
};

export const Slider = styled(SliderComponent)`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #ddd;
  outline: none;
  border-radius: 2px;
  margin: 8px 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
    cursor: pointer;
    transition: background 0.3s;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
    cursor: pointer;
    transition: background 0.3s;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

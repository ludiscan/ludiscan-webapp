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
  width: 100%;
  height: 4px;
  margin: 8px 0;
  appearance: none;
  outline: none;
  background: #ddd;
  border-radius: 2px;

  &::-webkit-slider-thumb {
    width: 16px;
    height: 16px;
    appearance: none;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
    border-radius: 50%;
    transition: background 0.3s;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    cursor: pointer;
    background: ${({ theme }) => theme.colors.primary.main || '#2196F3'};
    border-radius: 50%;
    transition: background 0.3s;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// atoms/Slider.tsx
import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { FC } from 'react';

import { FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { TextField } from '@src/component/molecules/TextField';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SliderProps = {
  className?: string;
  value?: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  sideLabel?: boolean;
  textField?: boolean; // テキストフィールドを表示するかどうか
  disabled?: boolean;
};

const calculateTooltipPosition = (inputElement: HTMLInputElement, value: number, min: number, max: number): number => {
  // 1) Get the total width of the input element (track + thumb overflow)
  const { width: sliderWidth } = inputElement.getBoundingClientRect();

  // 2) The pixel width of the thumb itself (must match CSS setting)
  const THUMB_WIDTH = 16; // CSSで &::-webkit-slider-thumb { width:16px; } を想定

  // 3) Compute available sliding width (where the center of thumb can travel)
  const availableWidth = sliderWidth - THUMB_WIDTH;

  // 4) Compute the relative percentage of the current value
  const percentage = (value - min) / (max - min);

  // 5) Compute the X offset for the center of the thumb
  //    If percentage==0 => offset = THUMB_WIDTH/2 (leftmost position)
  //    If percentage==1 => offset = availableWidth + THUMB_WIDTH/2 (rightmost)
  return percentage * availableWidth + THUMB_WIDTH / 2;
};

const SliderComponent: FC<SliderProps> = (args) => {
  const { className, value, onChange, min = 0, max = 100, step = 1, disabled = false, sideLabel = false, textField } = args;
  const { theme } = useSharedTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(value || min); // 初期値は min または value
  const [tooltipLeft, setTooltipLeft] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const setInputBackground = useCallback(
    (valueToSet: number) => {
      if (!inputRef.current) return;

      // 1) Calculate the percentage (0-100) of the current value
      const percentage = ((valueToSet - min) / (max - min)) * 100;

      // 2) Get theme colors
      const primaryColor = theme.colors.primary.light;
      const secondaryColor = theme.colors.text.secondary;

      // 3) Build the CSS gradient string
      // 4) Set input's background
      inputRef.current.style.background = `
        linear-gradient(
          to right,
          ${primaryColor} 0%,
          ${primaryColor} ${percentage}%,
          ${secondaryColor} ${percentage}%,
          ${secondaryColor} 100%
        )
      `;
    },
    [min, max, theme],
  );

  useEffect(() => {
    setInputBackground(sliderValue);
  }, [theme, setInputBackground, sliderValue]);

  const handleInputChange = useCallback(
    (value: string) => {
      const newValue = Number(value);
      setSliderValue(newValue);
      onChange(newValue); // 2) 親コンポーネントへも通知

      // 3) もし inputRef.current があれば、ツールチップの X 位置を再計算
      if (inputRef.current) {
        const newLeft = calculateTooltipPosition(inputRef.current, newValue, min, max);
        setTooltipLeft(newLeft);
      }
      setInputBackground(newValue);
    },
    [min, max, onChange, setInputBackground],
  );

  const handleDragStart = () => {
    setShowTooltip(true);
  };
  const handleDragEnd = () => {
    setShowTooltip(false);
  };
  const handleTextFieldChange = useCallback(
    (value: string) => {
      const newValue = Number(value);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        handleInputChange(String(newValue));
      }
    },
    [handleInputChange, max, min],
  );
  return (
    <FlexRow className={className} wrap={'nowrap'} align={'center'} gap={4}>
      {sideLabel && <Text fontSize={theme.typography.fontSize.xs} className={`${className}__label`} text={String(min)} />}
      <div className={`${className}__sliderWrapper`}>
        <input
          ref={inputRef}
          className={`${className}__input`}
          type='range'
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onFocus={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onBlur={handleDragEnd}
        />
        {showTooltip && (
          <div
            className={`${className}__tooltip`}
            style={{
              left: `${tooltipLeft}px`,
            }}
          >
            <Text text={String(sliderValue)} fontSize={theme.typography.fontSize.xs} />
          </div>
        )}
      </div>
      {sideLabel && <Text fontSize={theme.typography.fontSize.xs} className={`${className}__label`} text={String(max)} />}
      {textField && (
        <TextField
          className={`${className}__textField`}
          type={'number'}
          value={String(sliderValue)}
          onChange={handleTextFieldChange}
          placeholder={String(min)}
          fontSize={theme.typography.fontSize.xs}
        />
      )}
    </FlexRow>
  );
};

export const Slider = styled(SliderComponent)`
  overflow: hidden;

  &__sliderWrapper {
    position: relative; /* tooltip を絶対位置で配置するため */
    display: flex;
    align-items: center;
    width: calc(100% - ${({ sideLabel }) => (sideLabel ? '40px' : '0px')} - ${({ textField }) => (textField ? '39px' : '0')});
  }

  &__tooltip {
    position: absolute; /* sliderWrapper relative to this */
    padding: 4px 8px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.surface.base};
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 4px;
    transform: translateX(-50%) translateY(-100%);
  }

  &__input {
    width: 100%;
    height: 4px;
    padding: 0;
    margin: 8px 0;
    appearance: none;
    outline: none;
    background: ${({ theme }) => theme.colors.text.secondary};
    border-radius: 2px;

    &::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
      appearance: none;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.base};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 50%;
      transition: background 0.3s;
    }

    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.base};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 50%;
      transition: background 0.3s;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__label {
    width: 20px;
    text-align: center;
  }

  &__textField {
    width: 60px;
    margin-left: 8px;
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default} !important;
    border-radius: 4px;
  }
`;

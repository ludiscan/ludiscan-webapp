import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { FC, PointerEvent } from 'react';

import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type DraggableNumberInputProps = {
  className?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  sensitivity?: number;
  disabled?: boolean;
  precision?: number;
  label?: string;
};

const DraggableNumberInputComponent: FC<DraggableNumberInputProps> = (props) => {
  const { className, value, onChange, min = -Infinity, max = Infinity, step = 1, sensitivity = 0.5, disabled = false, precision = 2, label } = props;

  const { theme } = useSharedTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const dragStartX = useRef(0);
  const dragStartValue = useRef(value);
  const hasDragged = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(Number(value.toFixed(precision))));
    }
  }, [value, isEditing, precision]);

  const clamp = useCallback(
    (val: number) => {
      return Math.min(max, Math.max(min, val));
    },
    [min, max],
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled || isEditing) return;

      e.preventDefault();
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartValue.current = value;
      hasDragged.current = false;

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled, isEditing, value],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!isDragging || disabled) return;

      const deltaX = e.clientX - dragStartX.current;

      // ドラッグと判定する閾値（3px以上動いたらドラッグ）
      if (Math.abs(deltaX) > 3) {
        hasDragged.current = true;
      }

      if (!hasDragged.current) return;

      const deltaValue = deltaX * sensitivity * step;
      const newValue = clamp(dragStartValue.current + deltaValue);
      const steppedValue = Math.round(newValue / step) * step;

      onChange(Number(steppedValue.toFixed(precision)));
    },
    [isDragging, disabled, sensitivity, step, clamp, onChange, precision],
  );

  const enterEditMode = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [disabled]);

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (isDragging) {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        // ドラッグしていなければクリックとして編集モードに入る
        if (!hasDragged.current) {
          enterEditMode();
        }
      }
    },
    [isDragging, enterEditMode],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      const steppedValue = Math.round(clamped / step) * step;
      onChange(Number(steppedValue.toFixed(precision)));
    } else {
      setInputValue(String(Number(value.toFixed(precision))));
    }
  }, [inputValue, clamp, step, onChange, precision, value]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleInputBlur();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setInputValue(String(Number(value.toFixed(precision))));
      }
    },
    [handleInputBlur, value, precision],
  );

  return (
    <div
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-dragging={isDragging}
      data-disabled={disabled}
    >
      {label && <span className={`${className}__label`}>{label}</span>}
      <div className={`${className}__inputWrapper`}>
        <input
          ref={inputRef}
          className={`${className}__input`}
          type='number'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          readOnly={!isEditing}
          min={min !== -Infinity ? min : undefined}
          max={max !== Infinity ? max : undefined}
          step={step}
          style={{
            color: isEditing ? theme.colors.text.primary : theme.colors.text.secondary,
            cursor: isDragging ? 'ew-resize' : isEditing ? 'text' : 'ew-resize',
            pointerEvents: isEditing ? 'auto' : 'none',
          }}
        />
        {!isEditing && <div className={`${className}__dragOverlay`} />}
      </div>
    </div>
  );
};

export const DraggableNumberInput = styled(DraggableNumberInputComponent)`
  display: inline-flex;
  gap: 4px;
  align-items: center;

  &[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &__label {
    padding-right: 4px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    user-select: none;
  }

  &__inputWrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: ew-resize;
  }

  &__input {
    width: 64px;
    padding: 4px 8px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    text-align: right;

    /* Hide spin buttons */
    appearance: textfield;
    background: ${({ theme }) => theme.colors.surface.raised};
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    border-radius: 4px;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      margin: 0;
      appearance: none;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: 1px;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__dragOverlay {
    position: absolute;
    inset: 0;
    cursor: ew-resize;
  }

  &[data-dragging='true'] &__inputWrapper {
    cursor: ew-resize;
  }

  &[data-dragging='true'] &__input {
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

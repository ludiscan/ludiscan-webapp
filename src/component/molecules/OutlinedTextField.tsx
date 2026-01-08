import styled from '@emotion/styled';

import type { FC } from 'react';

type TextFieldOutlinedProps = {
  className?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fontSize?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
  border?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
  label?: string;
  color?: string;
  backgroundColor?: string;
  maxLength?: number;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
};

const BaseTextFieldOutlined: FC<TextFieldOutlinedProps> = ({ className, value, onChange, placeholder, type = 'text', label, maxLength = 200, disabled, onFocus, onBlur }) => {
  return (
    <div className={className}>
      <fieldset className={`${className}__fieldset`}>
        {/* legend 部分が枠の上端を一部切り欠いた形を作る */}
        {label && <legend className={`${className}__legend`}>{label}</legend>}
        <input
          className={`${className}__input`}
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          maxLength={maxLength}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </fieldset>
    </div>
  );
};

export const OutlinedTextField = styled(BaseTextFieldOutlined)`
  &__fieldset {
    position: relative;
    padding: 4px;
    margin-inline: 0;
    background: ${({ backgroundColor }) => backgroundColor || 'unset'};
    border: ${({ border = true, theme }) => (border ? `1px solid ${theme.colors.border.strong}` : 'none')};
    border-radius: 4px;
  }

  /* legend は初期状態だと fieldset の枠と干渉することが多いので工夫が必要 */
  &__legend {
    width: fit-content;
    padding: 0 4px;
    margin: 0 -4px;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};

    /* デフォルトだとラベルが両端に余白を取るので必要に応じて調整 */
  }

  /* input のスタイリング */
  &__input {
    display: block;
    width: 100%;
    padding: 0;
    font-size: ${({ fontSize, theme }) => fontSize || theme.typography.fontSize.base};
    font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
    line-height: 1.5;
    color: ${({ color, theme }) => color || theme.colors.text.primary};
    text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
    outline: none;
    background: unset;
    border: none;

    &::placeholder {
      color: ${({ theme }) => theme.colors.text.tertiary};
      opacity: 1;
    }

    &:disabled {
      color: ${({ theme }) => theme.colors.text.disabled};
      cursor: not-allowed;
    }
  }
`;

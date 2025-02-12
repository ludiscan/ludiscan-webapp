import styled from '@emotion/styled';

import type { FC } from 'react';

import { fontSizes, fontWeights } from '@/styles/style.ts';

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
};

const BaseTextFieldOutlined: FC<TextFieldOutlinedProps> = ({ className, value, onChange, placeholder, type = 'text', label, maxLength = 200 }) => {
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
        />
      </fieldset>
    </div>
  );
};

export const OutlinedTextField = styled(BaseTextFieldOutlined)`
  &__fieldset {
    background: ${({ backgroundColor }) => backgroundColor || 'unset'};
    position: relative;
    border: ${({ border = true, theme }) => (border ? `1px solid ${theme.colors.border.dark}` : 'none')};
    border-radius: 4px;
    padding: 4px 16px;
  }

  /* legend は初期状態だと fieldset の枠と干渉することが多いので工夫が必要 */
  &__legend {
    width: fit-content;
    font-size: ${fontSizes.small};
    font-weight: ${fontWeights.bold};
    margin: 0 -4px;
    padding: 0 4px;
    /* デフォルトだとラベルが両端に余白を取るので必要に応じて調整 */
  }

  /* input のスタイリング */
  &__input {
    display: block;
    width: 100%;
    font-size: ${({ fontSize = fontSizes.medium }) => fontSize};
    font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
    text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
    color: ${({ color }) => color || 'inherit'};
    border: none;
    outline: none;
    background: unset;
    padding: 0;
  }
`;

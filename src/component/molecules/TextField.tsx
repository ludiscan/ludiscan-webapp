import styled from '@emotion/styled';

import type { CSSProperties } from 'react';

export type TextFieldProps = {
  className?: string | undefined;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  outline?: boolean;
  type?: 'text' | 'password' | 'email' | 'number';
  fontSize?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
  id?: string;
  style?: CSSProperties;
};

const Component = ({ className, value, onChange, placeholder, type = 'text', id, style }: TextFieldProps) => {
  return (
    <input
      style={style}
      id={id ?? className}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
};

export const TextField = styled(Component)`
  /* Use logical properties for padding (Design Implementation Guide Rule 4) */
  padding-block: var(--spacing-sm);
  padding-inline: var(--spacing-sm);
  ${({ fontSize, theme }) => `font-size: ${fontSize ?? theme.typography.fontSize.base}`};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
  background: unset;
  border: var(--border-width-thin) solid ${({ theme }) => theme.colors.border.strong};
  border-radius: var(--border-radius-sm);

  /* Accessible focus styles (WCAG 2.2, Design Guide Rule 5) */
  &:focus {
    outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: var(--accessibility-focus-ring-offset);
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:focus-visible {
    outline: var(--accessibility-focus-ring-width) solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: var(--accessibility-focus-ring-offset);
  }

  /* Invalid state styling (Design Guide Rule 7) */
  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.semantic.error.main};
  }
`;

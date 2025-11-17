import styled from '@emotion/styled';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

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
  label?: string;
};

const Component = ({ className, value, onChange, placeholder, type = 'text', label }: TextFieldProps) => {
  const { theme } = useSharedTheme();

  const Input = (
    <input id={label ?? className} className={className} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
  );
  if (label) {
    return (
      <FlexColumn gap={2}>
        <Text text={label} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.bold} />
        {Input}
      </FlexColumn>
    );
  }
  return Input;
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

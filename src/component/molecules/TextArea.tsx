import styled from '@emotion/styled';

import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type TextAreaProps = {
  className?: string | undefined;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fontSize?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
  label?: string;
  maxLength?: number;
  minLength?: number;
};

const Component: FC<TextAreaProps> = ({ className, value, onChange, placeholder, label, maxLength, minLength }) => {
  const { theme } = useSharedTheme();
  const Input = (
    <textarea
      maxLength={maxLength}
      minLength={minLength}
      id={label ?? className}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
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

export const TextArea = styled(Component)`
  ${({ fontSize, theme }) => `font-size: ${fontSize || theme.typography.fontSize.base}`};
  box-sizing: border-box; /* better resizing */
  min-width: 120px;
  max-width: 100%;
  padding: 6px;
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
  resize: vertical;
  background: unset;
  border: 1px solid ${({ theme }) => theme.colors.border.strong};
  border-radius: 4px;

  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
  }
`;

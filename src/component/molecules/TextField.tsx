import styled from '@emotion/styled';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { fontSizes, fontWeights } from '@src/styles/style';

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
  const Input = (
    <input id={label ?? className} className={className} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} />
  );
  if (label) {
    return (
      <FlexColumn gap={2}>
        <Text text={label} fontSize={fontSizes.small} fontWeight={fontWeights.bold} />
        {Input}
      </FlexColumn>
    );
  }
  return Input;
};

export const TextField = styled(Component)`
  padding: 6px;
  ${({ fontSize = fontSizes.medium }) => `font-size: ${fontSize}`};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
  background: unset;
  border: 1px solid ${({ theme }) => theme.colors.border.strong};
  border-radius: 4px;

  &:focus {
    outline: none;
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
  }
`;

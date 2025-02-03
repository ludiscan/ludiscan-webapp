import styled from '@emotion/styled';

import type { FC } from 'react';

export type TextProps = {
  className?: string | undefined;
  text: string;
  fontSize?: string;
  color?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
};

const Component: FC<TextProps> = ({ className, text }) => {
  return <span className={className}>{text}</span>;
};

export const Text = styled(Component)`
  ${({ fontSize }) => `font-size: ${fontSize}`};
  ${({ color }) => `color: ${color}`};
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
`;

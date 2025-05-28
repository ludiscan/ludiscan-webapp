import styled from '@emotion/styled';

import type { CSSProperties, FC } from 'react';

export type TextProps = {
  className?: string | undefined;
  text: string;
  fontSize?: string;
  color?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
  style?: CSSProperties;
};

const Component: FC<TextProps> = ({ className, text, style }) => {
  return (
    <span className={className} style={style}>
      {text}
    </span>
  );
};

export const Text = styled(Component)`
  ${({ fontSize }) => fontSize && `font-size: ${fontSize}`};
  ${({ color }) => color && `color: ${color}`};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
`;

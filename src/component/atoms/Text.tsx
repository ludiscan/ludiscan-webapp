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

export type TextLinkProps = TextProps & {
  href: string;
  target?: '_blank' | '_self';
};

const Component: FC<TextProps | TextLinkProps> = (props) => {
  const { className, text, style } = props;
  if ('href' in props) {
    const { href, target = '_blank' } = props as TextLinkProps;
    return (
      <a className={className} href={href} style={{ ...style, color: 'unset' }} rel='noopener noreferrer' target={target}>
        {text}
      </a>
    );
  }
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
  text-decoration: none;
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
`;

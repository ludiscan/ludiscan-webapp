import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { CSSProperties } from 'react';

export type TextProps = {
  className?: string | undefined;
  text: string;
  fontSize?: string;
  color?: string;
  shadow?: boolean;
  fontWeight?: number | 'bolder' | 'lighter' | 'normal' | 'bold';
  style?: CSSProperties;
  maxLines?: number;
};

export type TextLinkProps = TextProps & {
  href: string;
  target?: '_blank' | '_self';
};

const Component = forwardRef<HTMLSpanElement | HTMLAnchorElement, TextProps | TextLinkProps>(function TextComponent(
  props,
  ref,
) {
  const { className, text, style } = props;
  if ('href' in props) {
    const { href, target = '_blank' } = props as TextLinkProps;
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={className}
        href={href}
        rel='noopener noreferrer'
        style={{ ...style, color: 'unset' }}
        target={target}
      >
        {text}
      </a>
    );
  }
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={className} style={style}>
      {text}
    </span>
  );
});

export const Text = styled(Component)`
  ${({ fontSize }) => fontSize && `font-size: ${fontSize}`};
  ${({ color }) => color && `color: ${color}`};
  font-weight: ${({ fontWeight }) => fontWeight || 'normal'};
  text-decoration: none;
  text-shadow: ${({ shadow }) => (shadow ? '0 0 4px rgba(0, 0, 0, 0.2)' : 'none')};
  ${({ maxLines }) =>
    maxLines && `display: -webkit-box; -webkit-line-clamp: ${maxLines}; line-clamp: ${maxLines}; -webkit-box-orient: vertical; overflow: hidden;`};
`;

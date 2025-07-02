import styled from '@emotion/styled';

import type { ReactNode } from 'react';

export type CardProps = {
  className?: string;
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  color?: string;
  border?: string;
  padding?: string;
  stopPropagate?: boolean;
  blur?: boolean;
};

const Component = ({ className, children, stopPropagate = false, blur }: CardProps) => {
  if (stopPropagate) {
    return (
      <div
        role={'button'}
        className={`${className} ${blur && 'blur'}`}
        tabIndex={0}
        onClick={(e) => {
          // stopping propagation to prevent parent click event by default
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            // Enter or Space で実行
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    );
  }
  return <div className={`${className} ${blur && 'blur'}`}>{children}</div>;
};

const shadowStyle = (props: CardProps) => {
  if (props.shadow === 'small') {
    return '0 2px 4px rgba(0, 0, 0, 0.1)';
  }
  if (props.shadow === 'medium') {
    return '0 4px 8px rgba(0, 0, 0, 0.1)';
  }
  if (props.shadow === 'large') {
    return '0 8px 16px rgba(0, 0, 0, 0.1)';
  }
  return 'none';
};

const hexToRgba = (hex: string, alpha: number) => {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const Card = styled(Component)`
  padding: ${({ padding }) => padding || '16px'};
  background-color: ${({ color, theme }) => color || theme.colors.surface.main};
  border: ${({ border }) => `1px solid ${border}`};
  border-radius: 8px;
  box-shadow: ${(props) => shadowStyle(props)};

  &.blur {
    background-color: ${({ color, theme }) => hexToRgba(color || theme.colors.surface.main, 0.7)};

    ${({ border }) => border && `border: 1px solid ${hexToRgba(border, 0.7)}`};
    /* 背景をぼかす */
    backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
  }
`;

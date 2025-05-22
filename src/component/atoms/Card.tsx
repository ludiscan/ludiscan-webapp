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
};

const Component = ({ className, children, stopPropagate = false }: CardProps) => {
  if (stopPropagate) {
    return (
      <div
        role={'button'}
        className={className}
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
  return <div className={className}>{children}</div>;
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

export const Card = styled(Component)`
  padding: ${({ padding }) => padding || '16px'};
  background-color: ${({ color, theme }) => color || theme.colors.surface.main};
  border: ${({ border }) => `1px solid ${border}`};
  border-radius: 8px;
  box-shadow: ${(props) => shadowStyle(props)};
`;

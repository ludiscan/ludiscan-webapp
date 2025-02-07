import styled from '@emotion/styled';

import type { ReactNode } from 'react';

export type CartProps = {
  className?: string;
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  color?: string;
  border?: string;
};

const Component = ({ className, children }: CartProps) => {
  return <div className={className}>{children}</div>;
};

export const Card = styled(Component)`
  padding: 16px;
  background-color: ${({ color, theme }) => color || theme.colors.surface.main};
  border: ${({ border }) => `1px solid ${border}`};
  border-radius: 8px;
  box-shadow: ${({ shadow }) =>
    shadow === 'small'
      ? '0 2px 4px rgba(0, 0, 0, 0.1)'
      : shadow === 'medium'
        ? '0 4px 8px rgba(0, 0, 0, 0.1)'
        : shadow === 'large'
          ? '0 8px 16px rgba(0, 0, 0, 0.1)'
          : 'none'};
`;

import styled from '@emotion/styled';

import type { ReactNode } from 'react';

export type CartProps = {
  className?: string;
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  color?: string;
  border?: string;
  padding?: string;
};

const Component = ({ className, children }: CartProps) => {
  return <div className={className}>{children}</div>;
};

const shadowStyle = (props: CartProps) => {
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
  box-shadow: ${props => shadowStyle(props)};
`;

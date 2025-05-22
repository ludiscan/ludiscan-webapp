import styled from '@emotion/styled';

import type { ButtonProps } from '@src/component/atoms/Button';
import type { ReactNode } from 'react';

import { Button } from '@src/component/atoms/Button';

export type CardProps = {
  className?: string;
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  color?: string;
  border?: string;
  padding?: string;
  onClick?: ButtonProps['onClick'];
};

const Component = ({ className, children, onClick }: CardProps) => {
  if (onClick) {
    return (
      <Button scheme={'none'} fontSize={'medium'} className={className} onClick={onClick}>
        {children}
      </Button>
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

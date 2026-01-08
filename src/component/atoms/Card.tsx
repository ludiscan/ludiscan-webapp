import styled from '@emotion/styled';

import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { hexToRGBA } from '@src/styles/style';

export type CardProps = ComponentPropsWithoutRef<'div'> & {
  className?: string;
  children: ReactNode;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  color?: string;
  border?: string;
  borderWidth?: string;
  padding?: string;
  stopPropagate?: boolean;
  blur?: boolean | 'low' | 'medium' | 'high';
};

const toBlurValue = (blur: boolean | 'low' | 'medium' | 'high'): string | undefined => {
  if (blur === true) return 'medium';
  if (blur === false || blur === undefined) return undefined;
  return blur;
};

const Component = ({
  className,
  children,
  stopPropagate = false,
  blur,
  shadow: _shadow,
  color: _color,
  border: _border,
  borderWidth: _borderWidth,
  padding: _padding,
  ...rest
}: CardProps) => {
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
        {...rest}
      >
        {children}
      </div>
    );
  }
  return (
    <div className={`${className} ${blur ? `blur-${toBlurValue(blur)}` : ''}`} {...rest}>
      {children}
    </div>
  );
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
  background-color: ${({ color, theme }) => color || theme.colors.surface.base};
  ${({ border, borderWidth }) => border && `border: ${borderWidth || '1px'} solid ${border};`}
  border-radius: 8px;
  box-shadow: ${(props) => shadowStyle(props)};

  &.blur-low {
    background-color: ${({ color, theme }) => hexToRGBA(color || theme.colors.surface.base, 0.4)};
    ${({ border, borderWidth }) => border && `border: ${borderWidth || '1px'} solid ${hexToRGBA(border, 1)};`}
    backdrop-filter: blur(4px);
  }

  &.blur-medium {
    background-color: ${({ color, theme }) => hexToRGBA(color || theme.colors.surface.base, 0.6)};
    ${({ border, borderWidth }) => border && `border: ${borderWidth || '1px'} solid ${hexToRGBA(border, 1)};`}
    backdrop-filter: blur(8px);
  }

  &.blur-high {
    background-color: ${({ color, theme }) => hexToRGBA(color || theme.colors.surface.base, 0.8)};
    ${({ border, borderWidth }) => border && `border: ${borderWidth || '1px'} solid ${hexToRGBA(border, 1)};`}
    backdrop-filter: blur(12px);
  }
`;

export type PanelCardProps = Omit<CardProps, 'blur' | 'border' | 'borderWidth'>;

export const PanelCard: FC<PanelCardProps> = (props) => {
  const { theme } = useSharedTheme();
  return <Card {...props} blur={'medium'} border={theme.colors.border.strong} borderWidth={'1px'} />;
};

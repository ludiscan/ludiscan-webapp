import styled from '@emotion/styled';

import type { TextLinkProps, TextProps } from '@src/component/atoms/Text';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
type Orientation = 'horizontal' | 'vertical';
type Side = 'both' | 'left' | 'right';

export type LinedTextProps = (TextProps | TextLinkProps) & {
  orientation?: Orientation;
  side?: Side;
  lineColor?: string;
  lineThickness?: string;
  gap?: string;
  lineLength?: string; // 水平線の長さ（auto相当はfullWidthで指定）
  verticalHeight?: string; // 垂直線の高さ
  fullWidth?: boolean; // 水平のみ：伸縮
  textClassName?: string; // 内側Text用クラス
};

type SharedStyleProps = {
  side: Side;
  lineColor: string;
  lineThickness: string;
  gap: string;
};

type HorizontalStyleProps = SharedStyleProps & {
  fullWidth: boolean;
  lineLength: string;
};

type VerticalStyleProps = SharedStyleProps & {
  verticalHeight: string;
};

const filterProps = (prop: string) =>
  !['orientation', 'side', 'lineColor', 'lineThickness', 'gap', 'lineLength', 'verticalHeight', 'fullWidth', 'textClassName'].includes(prop);

// 水平用
const HorizontalWrapper = styled('span', { shouldForwardProp: filterProps })<HorizontalStyleProps>`
  position: relative;
  display: ${({ fullWidth }) => (fullWidth ? 'flex' : 'inline-flex')};
  align-items: center;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  vertical-align: middle;

  &::before,
  &::after {
    content: '';
    border-top: ${({ lineThickness, lineColor }) => `${lineThickness} solid ${lineColor}`};
    ${({ fullWidth, lineLength }) => (fullWidth ? 'flex: 1 1 0%; width: auto;' : `flex: 0 0 auto; width: ${lineLength};`)}
  }

  &::before {
    margin-right: ${({ gap }) => gap};
    ${({ side }) => (side === 'right' ? 'display: none;' : '')}
  }

  &::after {
    margin-left: ${({ gap }) => gap};
    ${({ side }) => (side === 'left' ? 'display: none;' : '')}
  }
`;

// 垂直用
const VerticalWrapper = styled('span', { shouldForwardProp: filterProps })<VerticalStyleProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;

  &::before,
  &::after {
    display: inline-block;
    width: ${({ lineThickness }) => lineThickness};
    height: ${({ verticalHeight }) => verticalHeight};
    content: '';
    background: ${({ lineColor }) => lineColor};
  }

  &::before {
    margin-right: ${({ gap }) => gap};
    ${({ side }) => (side === 'right' ? 'display: none;' : '')}
  }

  &::after {
    margin-left: ${({ gap }) => gap};
    ${({ side }) => (side === 'left' ? 'display: none;' : '')}
  }
`;

export const LinedText: FC<LinedTextProps> = (props) => {
  const {
    orientation = 'horizontal',
    side = 'both',
    lineColor = 'currentColor',
    lineThickness = '1px',
    gap = '0.5rem',
    lineLength = '1.5em',
    verticalHeight = '1em',
    fullWidth = false,
    textClassName,
    ...textProps
  } = props as LinedTextProps;

  // ★ switchは使わず、if / elseで分岐
  if (orientation === 'horizontal') {
    return (
      <HorizontalWrapper
        side={side}
        lineColor={lineColor}
        lineThickness={lineThickness}
        gap={gap}
        lineLength={lineLength}
        fullWidth={fullWidth}
        className={(textProps as TextProps).className}
      >
        <Text {...(textProps as TextProps | TextLinkProps)} className={textClassName} />
      </HorizontalWrapper>
    );
  }
  return (
    <VerticalWrapper
      side={side}
      lineColor={lineColor}
      lineThickness={lineThickness}
      gap={gap}
      verticalHeight={verticalHeight}
      className={(textProps as TextProps).className}
    >
      <Text {...(textProps as TextProps | TextLinkProps)} className={textClassName} />
    </VerticalWrapper>
  );
};

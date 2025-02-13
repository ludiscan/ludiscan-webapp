// atoms/Tooltip.tsx
import styled from '@emotion/styled';

import type { FC, ReactNode } from 'react';

import { zIndexes } from '@/styles/style.ts';

export type TooltipProps = {
  className?: string;
  children: ReactNode;
  tooltip: string;
  /** Tooltipの表示位置を指定します。'top'（デフォルト）|'bottom'|'left'|'right' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipComponent: FC<TooltipProps> = ({ className, children, tooltip, placement }) => {
  return (
    <div className={className}>
      {children}
      <span className={`${className}__tooltip-text ${placement}`}>{tooltip}</span>
    </div>
  );
};

export const Tooltip = styled(TooltipComponent)<TooltipProps>`
  position: relative;
  display: inline-block;

  &__tooltip-text {
    position: absolute;
    z-index: ${zIndexes.tooltip};
    visibility: hidden;
    width: max-content;
    padding: 4px 8px;
    color: ${({ theme }) => theme.colors.text || '#fff'};
    text-align: center;
    white-space: nowrap;
    background-color: ${({ theme }) => theme.colors.surface.light || '#000'};
    border-radius: 4px;
    box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &__tooltip-text.top {
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  &__tooltip-text.bottom {
    top: 125%;
    left: 50%;
    transform: translateX(-50%);
  }

  &__tooltip-text.left {
    top: 50%;
    right: 125%;
    transform: translateY(-50%);
  }

  &__tooltip-text.right {
    top: 50%;
    left: 125%;
    transform: translateY(-50%);
  }

  &:hover &__tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

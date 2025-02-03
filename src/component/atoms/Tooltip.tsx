// atoms/Tooltip.tsx
import styled from '@emotion/styled';

import { zIndexes } from '../../styles/style';

import type { FC, ReactNode } from 'react';

export type TooltipProps = {
  className?: string;
  children: ReactNode;
  tooltip: string;
  /** Tooltipの表示位置を指定します。'top'（デフォルト）|'bottom'|'left'|'right' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipComponent: FC<TooltipProps> = ({ className, children, tooltip }) => {
  return (
    <div className={className}>
      {children}
      <span className={`${className}__tooltip-text`}>{tooltip}</span>
    </div>
  );
};

export const Tooltip = styled(TooltipComponent)<TooltipProps>`
  position: relative;
  display: inline-block;

  &__tooltip-text {
    visibility: hidden;
    width: max-content;
    background-color: ${({ theme }) => theme.colors.surface.light || '#000'};
    color: ${({ theme }) => theme.colors.text || '#fff'};
    text-align: center;
    border-radius: 4px;
    padding: 4px 8px;
    position: absolute;
    z-index: ${zIndexes.tooltip};
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    ${({ placement = 'top' }) => {
  switch (placement) {
    case 'top':
      return `
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
          `;
    case 'bottom':
      return `
            top: 125%;
            left: 50%;
            transform: translateX(-50%);
          `;
    case 'left':
      return `
            right: 125%;
            top: 50%;
            transform: translateY(-50%);
          `;
    case 'right':
      return `
            left: 125%;
            top: 50%;
            transform: translateY(-50%);
          `;
    default:
      return `
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
          `;
  }
}}
  }

  &:hover &__tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

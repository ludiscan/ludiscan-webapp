import styled from '@emotion/styled';
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

import type { TextProps } from '@src/component/atoms/Text';
import type { FC, ReactNode } from 'react';

import { Text } from '@src/component/atoms/Text';
import { zIndexes } from '@src/styles/style';

export type TooltipProps = Pick<TextProps, 'fontSize' | 'fontWeight' | 'color'> & {
  className?: string;
  children: ReactNode;
  tooltip: string;
  /** Tooltipの表示位置を指定します。'top'（デフォルト）|'bottom'|'left'|'right' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
};

// ツールチップテキストのスタイル
const TooltipText = styled(Text)<{ placement: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute;
  z-index: ${zIndexes.tooltip};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
  pointer-events: none; /* ユーザーの操作に影響させない */
  background-color: ${({ theme }) => theme.colors.surface.sunken};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  opacity: 1;
  transform: translate(-50%, -100%);
  transition: opacity 0.3s ease-in-out;
`;

const TooltipComponent: FC<TooltipProps> = (props) => {
  const { className, children, tooltip, placement = 'top' } = props;
  // ツールチップの表示・非表示状態
  const [visible, setVisible] = useState(false);
  // ツールチップの位置情報
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  // ホバー対象のラッパー参照
  const wrapperRef = useRef<HTMLDivElement>(null);

  // マウスホバー時のハンドラ
  const handleMouseEnter = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      // 配置（placement）に応じた位置計算
      if (placement === 'top') {
        top = rect.top - rect.height * 2;
        left = rect.left + rect.width / 2;
      } else if (placement === 'bottom') {
        top = rect.bottom + rect.height * 2;
        left = rect.left + rect.width / 2;
      } else if (placement === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left;
      } else if (placement === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + rect.width;
      }
      setTooltipPos({ top, left });
    }
    setVisible(true);
  };

  // マウスリーブ時のハンドラ
  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }} // 親要素として必要
    >
      {children}
      {visible &&
        createPortal(
          <TooltipText fontSize={props.fontSize} placement={placement} style={{ top: tooltipPos.top, left: tooltipPos.left }} text={tooltip} />,
          document.body,
        )}
    </div>
  );
};

export const Tooltip = styled(TooltipComponent)`
  position: relative;
`;

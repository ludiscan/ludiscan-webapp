import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import type { CanvasTooltipData } from '@src/utils/canvasEventBus';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { zIndexes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

// モバイルデバイス判定
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// モバイルでのtooltip自動非表示時間（ミリ秒）
const MOBILE_TOOLTIP_AUTO_HIDE_MS = 2500;

const TooltipContainer = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${({ y }) => y}px;
  left: ${({ x }) => x}px;
  z-index: ${zIndexes.tooltip};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  pointer-events: none;
  background-color: ${({ theme }) => theme.colors.surface.sunken};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transform: translate(-50%, calc(-100% - 8px));
`;

type TooltipState = {
  visible: boolean;
  content: string;
  screenX: number;
  screenY: number;
};

const CanvasTooltipComponent: FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: '',
    screenX: 0,
    screenY: 0,
  });
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const handleHide = useCallback(() => {
    clearAutoHideTimer();
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, [clearAutoHideTimer]);

  const handleShow = useCallback(
    (event: CustomEvent<CanvasTooltipData>) => {
      const { content, screenX, screenY } = event.detail;
      setTooltip({
        visible: true,
        content,
        screenX,
        screenY,
      });

      // モバイルデバイスの場合、自動非表示タイマーを設定
      clearAutoHideTimer();
      if (isTouchDevice()) {
        autoHideTimerRef.current = setTimeout(() => {
          handleHide();
        }, MOBILE_TOOLTIP_AUTO_HIDE_MS);
      }
    },
    [clearAutoHideTimer, handleHide],
  );

  useEffect(() => {
    heatMapEventBus.on('canvas-tooltip:show', handleShow);
    heatMapEventBus.on('canvas-tooltip:hide', handleHide);
    return () => {
      heatMapEventBus.off('canvas-tooltip:show', handleShow);
      heatMapEventBus.off('canvas-tooltip:hide', handleHide);
      clearAutoHideTimer();
    };
  }, [handleShow, handleHide, clearAutoHideTimer]);

  if (!tooltip.visible || !tooltip.content) {
    return null;
  }

  return (
    <TooltipContainer x={tooltip.screenX} y={tooltip.screenY}>
      <Text text={tooltip.content} fontSize='sm' />
    </TooltipContainer>
  );
};

export const CanvasTooltip = memo(CanvasTooltipComponent);

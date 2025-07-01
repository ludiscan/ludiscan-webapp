import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BiPause, BiPlay } from 'react-icons/bi';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { Theme } from '@emotion/react';
import type { FC, ChangeEventHandler } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type TimelineControllerBlockProps = {
  className?: string;
  isPlaying: boolean;
  currentTime: number;
  currentMinTime: number;
  currentMaxTime: number;
  maxTime: number;
  onClickMenu: () => void;
  onClickPlay: () => void;
  onChangeMinTime: (time: number) => void;
  onChangeMaxTime: (time: number) => void;
  onSeek: (time: number) => void;
};

const Component: FC<TimelineControllerBlockProps> = ({
  className,
  isPlaying,
  currentTime,
  currentMinTime,
  currentMaxTime,
  maxTime,
  onClickPlay,
  onClickMenu,
  onChangeMinTime,
  onChangeMaxTime,
  onSeek,
}) => {
  const { theme } = useSharedTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMenusOpen, setIsMenusOpen] = useState(false);
  const gradEle = useRef<'min' | 'max' | null>(null);
  const draggingElement = useRef<(EventTarget & HTMLElement) | null>(null);

  const handleSeek = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const newTime = Number(e.currentTarget.value);
      if (newTime < currentMinTime || newTime > currentMaxTime) {
        return; // Seek outside the min-max range
      }
      onSeek(newTime);
    },
    [currentMaxTime, currentMinTime, onSeek],
  );

  // thumb の left を計算
  const minPct = currentMinTime / maxTime;
  const maxPct = currentMaxTime / maxTime;

  const currentTimeLabel = useMemo(() => {
    if (maxTime <= 0) return '00:00';
    const sec = currentTime / 1000;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    // const cs = Math.floor((sec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [currentTime, maxTime]);

  const handleMinDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    gradEle.current = 'min';
    draggingElement.current = event.currentTarget;
  }, []);

  const handleMaxDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    gradEle.current = 'max';
    draggingElement.current = event.currentTarget;
  }, []);

  const handleMove = useCallback(
    (e: MouseEvent): void => {
      if (!draggingElement.current) return;
      const trackRect = trackRef.current?.getBoundingClientRect();
      if (!trackRect) return;
      e.preventDefault();

      const offsetX = e.clientX - trackRect.left;
      const newTime = Math.max(0, Math.min(maxTime, (offsetX / trackRect.width) * maxTime));
      if (gradEle.current === 'min' && newTime < currentTime - 500) {
        onChangeMinTime(newTime);
      } else if (gradEle.current === 'max' && newTime > currentTime + 500) {
        onChangeMaxTime(newTime);
      }
    },
    [maxTime, currentTime, onChangeMinTime, onChangeMaxTime],
  );

  // mouseupが発生したときに実行する関数
  const handleUp = useCallback((_: MouseEvent): void => {
    if (!draggingElement.current) return;

    draggingElement.current = null;
    gradEle.current = null;
  }, []);

  useEffect(() => {
    document.body.addEventListener('mousemove', handleMove);
    document.body.addEventListener('mouseup', handleUp);
    document.body.addEventListener('mouseleave', handleUp);

    return () => {
      document.body.removeEventListener('mousemove', handleMove);
      document.body.removeEventListener('mouseup', handleUp);
      document.body.removeEventListener('mouseleave', handleUp);
    };
  }, [handleMove, handleUp]);

  return (
    <Card color={theme.colors.surface.main} className={className} shadow='medium' border={theme.colors.border.main} stopPropagate>
      <InlineFlexColumn>
        {isMenusOpen && (
          <InlineFlexRow>
            <Button onClick={onClickMenu} scheme='surface' fontSize='small'>
              <IoEllipsisHorizontal />
            </Button>
          </InlineFlexRow>
        )}
        <InlineFlexRow align='center' gap={12}>
          <Button onClick={onClickPlay} scheme='primary' fontSize='small'>
            {isPlaying ? <BiPause /> : <BiPlay />}
          </Button>

          <div className={`${className}__sliderWrapper`} ref={trackRef}>
            <div className={`${className}__sliderBackground`} />

            {/* min-thumnb */}
            <div
              role='button'
              tabIndex={0}
              id={'min-thumb'}
              className={`${className}__thumb ${className}__thumb--min min-thumb draggable`}
              style={{ left: `${minPct * 100}%` }}
              onMouseDown={handleMinDown}
            />

            {/* 現在位置スライダー */}
            <input type='range' className={`${className}__seekBarInput`} min={0} max={maxTime} value={currentTime} onChange={handleSeek} />
            {/* max-thumb */}
            <div
              role='button'
              tabIndex={0}
              id={'max-thumb'}
              className={`${className}__thumb ${className}__thumb--max max-thumb draggable`}
              style={{ left: `${maxPct * 100}%` }}
              onMouseDown={handleMaxDown}
            />
          </div>

          <div className={`${className}__time`}>{currentTimeLabel}</div>
          <Button onClick={onClickMenu} scheme='surface' fontSize='small'>
            <IoEllipsisHorizontal />
          </Button>
        </InlineFlexRow>
      </InlineFlexColumn>
    </Card>
  );
};

const createBackgroundGradient = (theme: Theme, currentMinTime: number, currentMaxTime: number, maxTime: number) => {
  const minPct = (currentMinTime / maxTime) * 100;
  const maxPct = (currentMaxTime / maxTime) * 100;
  return `linear-gradient(
    to right,
    ${theme.colors.secondary.light} 0%,
    ${theme.colors.secondary.light} ${minPct}%,
    ${theme.colors.primary.main} ${minPct}%,
    ${theme.colors.primary.main} ${maxPct}%,
    ${theme.colors.secondary.light} ${maxPct}%,
    ${theme.colors.secondary.light} 100%
  )`;
};

export const TimelineControllerBlock = styled(Component)`
  min-width: 300px;
  width: fit-content;
  padding: 16px;

  &__sliderWrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
    height: 20px;
  }
  &__sliderBackground {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 4px;
    width: 100%;
    border-radius: 2px;
    /* 色分けグラデ */
    background: ${({ theme, currentMinTime, currentMaxTime, maxTime }) => createBackgroundGradient(theme, currentMinTime, currentMaxTime, maxTime)};
  }

  /* thumb 共通 */
  &__thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary.main};
    cursor: pointer;
    z-index: 5;
  }
  &__thumb--min {
    /* 追加スタイリングがあれば */
  }
  &__thumb--max {
    /* 追加スタイリングがあれば */
  }

  /* 現在位置スライダーは最前面 */
  &__seekBarInput {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    appearance: none;
    background: transparent;
    z-index: 4;
    &::-webkit-slider-thumb {
      /* English comment: taller thumb for current */
      width: 6px;
      height: 20px;
      appearance: none;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.main};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 8px;
    }
    &::-moz-range-thumb {
      width: 6px;
      height: 20px;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.main};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 8px;
    }
  }
`;

import styled from '@emotion/styled';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GrContract, GrExpand } from 'react-icons/gr';
import { IoMenu, IoPause, IoPlay, IoPlayBackSharp, IoPlayForwardSharp } from 'react-icons/io5';
import { RiPlayMiniFill, RiPlayReverseMiniFill } from 'react-icons/ri';

import type { Theme } from '@emotion/react';
import type { FC, ChangeEventHandler } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexRow, InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export const PlaySpeed = [0.25, 0.5, 1, 2, 4] as const;
export type PlaySpeedType = (typeof PlaySpeed)[number];
export type TimelineControllerBlockProps = {
  className?: string;
  isPlaying: boolean;
  currentTime: number;
  currentMinTime: number;
  currentMaxTime: number;
  maxTime: number;
  playSpeed?: PlaySpeedType;
  onClickMenu: () => void;
  onClickPlay: () => void;
  onChangeMinTime: (time: number) => void;
  onChangeMaxTime: (time: number) => void;
  onSeek: (time: number) => void;
  onClickBackFrame: () => void;
  onClickForwardFrame: () => void;
  onChangePlaySpeed?: (speed: PlaySpeedType) => void;
};

const Component: FC<TimelineControllerBlockProps> = ({
  className,
  isPlaying,
  currentTime,
  currentMinTime,
  currentMaxTime,
  maxTime,
  playSpeed = 1,
  onClickPlay,
  onClickMenu,
  onChangeMinTime,
  onChangeMaxTime,
  onSeek,
  onClickBackFrame,
  onClickForwardFrame,
  onChangePlaySpeed = () => {},
}) => {
  const { theme } = useSharedTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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

  const maxTimeLabel = useMemo(() => {
    if (maxTime <= 0) return '00:00';
    const sec = maxTime / 1000;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    // const cs = Math.floor((sec % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [maxTime]);

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
    <Card
      color={theme.colors.surface.main}
      className={`${className} ${isDetailOpen && 'open'}`}
      shadow='medium'
      border={theme.colors.border.main}
      stopPropagate
      blur
    >
      <FlexRow style={{ width: '100%' }} wrap={'nowrap'} gap={8}>
        <InlineFlexColumn style={{ width: '100%' }}>
          {isDetailOpen && (
            <InlineFlexRow align={'center'} gap={12} style={{ width: '100%' }} wrap={'nowrap'}>
              <InlineFlexRow align={'center'} gap={4}>
                <Button onClick={onClickBackFrame} scheme={'none'} fontSize={'medium'}>
                  <IoPlayBackSharp />
                </Button>
                <Button className={`${className}__playButton`} onClick={onClickPlay} scheme={'none'} fontSize={'large3'}>
                  {isPlaying ? <IoPause /> : <IoPlay />}
                </Button>
                <Button onClick={onClickForwardFrame} scheme={'none'} fontSize={'medium'}>
                  <IoPlayForwardSharp />
                </Button>
              </InlineFlexRow>
              <div style={{ flex: 1 }} />
              {/* Play Speed Selector */}
              <InlineFlexRow align={'center'} gap={4}>
                {PlaySpeed.map((value) => (
                  <Button key={value} onClick={() => onChangePlaySpeed(value)} scheme={'none'} fontSize={'small'}>
                    <Text
                      className={`${className}__playSpeedText`}
                      text={`${value}x`}
                      fontSize={playSpeed === value ? fontSizes.medium : fontSizes.small}
                      color={playSpeed === value ? theme.colors.text : theme.colors.secondary.main}
                    />
                  </Button>
                ))}
              </InlineFlexRow>
              <Button onClick={onClickMenu} scheme={'none'} fontSize={'large1'}>
                <IoMenu />
              </Button>
            </InlineFlexRow>
          )}
          <InlineFlexRow align={'center'} gap={12} style={{ width: '100%' }} wrap={'nowrap'}>
            {!isDetailOpen && (
              <InlineFlexRow align={'center'} gap={4}>
                <Button onClick={onClickBackFrame} scheme={'none'} fontSize={'small'}>
                  <IoPlayBackSharp />
                </Button>
                <Button className={`${className}__playButton`} onClick={onClickPlay} scheme={'none'} fontSize={'large2'}>
                  {isPlaying ? <IoPause /> : <IoPlay />}
                </Button>
                <Button onClick={onClickForwardFrame} scheme={'none'} fontSize={'small'}>
                  <IoPlayForwardSharp />
                </Button>
              </InlineFlexRow>
            )}

            <div className={`${className}__sliderWrapper`} ref={trackRef}>
              {!isDetailOpen && (
                <>
                  <Text className={`${className}__speedLabel`} text={`${playSpeed}x`} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
                  <Text className={`${className}__label`} text={`${currentTimeLabel}/${maxTimeLabel}`} fontSize={fontSizes.small} />
                </>
              )}
              <div className={`${className}__sliderBackground`} />

              {/* min-thumnb */}
              <div
                role='button'
                tabIndex={0}
                id={'min-thumb'}
                className={`${className}__thumb ${className}__thumb--min min-thumb draggable`}
                style={{ left: `${minPct * 100}%` }}
                onMouseDown={handleMinDown}
              >
                <RiPlayMiniFill color={theme.colors.primary.main} size={20} />
              </div>

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
              >
                <RiPlayReverseMiniFill color={theme.colors.primary.main} size={20} />
              </div>
            </div>
            {isDetailOpen && <Text className={`${className}__label open`} text={`${currentTimeLabel}/${maxTimeLabel}`} fontSize={fontSizes.small} />}
            <Button
              className={`${className}__toggleButton ${isDetailOpen ? 'open' : ''}`}
              onClick={() => setIsDetailOpen(!isDetailOpen)}
              scheme={'none'}
              fontSize={'medium'}
            >
              {!isDetailOpen ? (
                <span className='icon-expand'>
                  <GrExpand size={16} />
                </span>
              ) : (
                <span className='icon-contract'>
                  <GrContract size={16} />
                </span>
              )}
            </Button>
          </InlineFlexRow>
        </InlineFlexColumn>
      </FlexRow>
    </Card>
  );
};

const createBackgroundGradient = (theme: Theme, currentMinTime: number, currentMaxTime: number, maxTime: number) => {
  const minPct = (currentMinTime / maxTime) * 100;
  const maxPct = (currentMaxTime / maxTime) * 100;
  const activeColor = theme.colors.primary.main;
  const inactiveColor = theme.colors.secondary.light;
  return `linear-gradient(
    to right,
    ${inactiveColor} 0%,
    ${inactiveColor} ${minPct}%,
    ${activeColor} ${minPct}%,
    ${activeColor} ${maxPct}%,
    ${inactiveColor} ${maxPct}%,
    ${inactiveColor} 100%
  )`;
};

export const TimelineControllerBlock = memo(
  styled(Component)`
    max-width: 450px;
    height: 24px;
    padding: 16px 16px 20px;
    color: ${({ theme }) => theme.colors.text};
    border-radius: 32px;
    transition: all 0.2s ease-in-out;

    &.open {
      height: 45px;
    }

    &__sliderWrapper {
      position: relative;
      flex: 1;
      min-width: 150px;
      height: 20px;
    }

    &__sliderBackground {
      position: absolute;
      top: 50%;
      width: 100%;
      height: 4px;
      background: ${({ theme, currentMinTime, currentMaxTime, maxTime }) => createBackgroundGradient(theme, currentMinTime, currentMaxTime, maxTime)};
      border-radius: 2px;
      transform: translateY(-50%);
    }

    /* thumb 共通 */
    &__thumb {
      position: absolute;
      top: 50%;
      z-index: 5;
      display: flex;
      align-content: center;
      cursor: pointer;
      transform: translate(-50%, -50%);
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
      z-index: 4;
      width: 100%;
      height: 100%;
      appearance: none;
      background: transparent;

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

    &__toggleButton {
      position: relative;

      .icon-expand,
      .icon-contract {
        opacity: 0;
        transition:
          opacity 0.2s ease,
          transform 0.2s ease;
      }

      /* closed 状態 → expand アイコンを表示 */
      &:not(.open) .icon-expand {
        opacity: 1;
        transform: rotate(0deg);
      }

      /* open 状態 → contract アイコンを表示＆軽く回転 */
      &.open .icon-contract {
        opacity: 1;
        transform: rotate(180deg);
      }
    }

    &__label {
      position: absolute;
      right: 0;
      bottom: -18px;
      transition: all 0.2s ease-in-out;

      &.open {
        position: unset;
      }
    }

    &__speedLabel {
      position: absolute;
      right: 0;
      bottom: 13px;
    }

    &__playSpeedText {
      transition: all 0.2s ease-in-out;
    }
  `,
  (prev, next) => {
    return (
      prev.isPlaying === next.isPlaying &&
      prev.currentTime === next.currentTime &&
      prev.currentMinTime === next.currentMinTime &&
      prev.currentMaxTime === next.currentMaxTime &&
      prev.maxTime === next.maxTime &&
      prev.playSpeed === next.playSpeed
    );
  },
);

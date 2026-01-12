import styled from '@emotion/styled';
import { memo, useCallback, useMemo, useState } from 'react';
import { GrContract, GrExpand } from 'react-icons/gr';
import { IoMenu, IoPause, IoPlay, IoPlayBackSharp, IoPlayForwardSharp } from 'react-icons/io5';

import type { FC, ChangeEventHandler } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

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
  maxTime,
  playSpeed = 1,
  onClickPlay,
  onClickMenu,
  onSeek,
  onClickBackFrame,
  onClickForwardFrame,
  onChangePlaySpeed = () => {},
}) => {
  const { theme } = useSharedTheme();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleSeek = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const newTime = Number(e.currentTarget.value);
      onSeek(newTime);
    },
    [onSeek],
  );

  const currentTimeLabel = useMemo(() => {
    if (maxTime <= 0) return '00:00';
    const sec = currentTime / 1000;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [currentTime, maxTime]);

  const maxTimeLabel = useMemo(() => {
    if (maxTime <= 0) return '00:00';
    const sec = maxTime / 1000;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [maxTime]);

  const progressPercent = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;

  return (
    <Card
      color={theme.colors.surface.base}
      className={`${className} ${isDetailOpen ? 'open' : ''}`}
      shadow='medium'
      border={theme.colors.border.default}
      padding={'0'}
      stopPropagate
      blur
    >
      <div className={`${className}__content`}>
        {/* 再生コントロール */}
        <div className={`${className}__playControls`}>
          <Button onClick={onClickBackFrame} scheme={'none'} fontSize={'lg'}>
            <IoPlayBackSharp />
          </Button>
          <Button onClick={onClickPlay} scheme={'none'} fontSize={'3xl'}>
            {isPlaying ? <IoPause /> : <IoPlay />}
          </Button>
          <Button onClick={onClickForwardFrame} scheme={'none'} fontSize={'lg'}>
            <IoPlayForwardSharp />
          </Button>
        </div>

        {/* シークバー */}
        <div className={`${className}__sliderWrapper`}>
          <input
            type='range'
            className={`${className}__seekBar`}
            min={0}
            max={maxTime}
            value={currentTime}
            onChange={handleSeek}
            style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
          />
          <InlineFlexRow className={`${className}__seekTimes`} align={'center'} wrap={'nowrap'}>
            <Text text={currentTimeLabel} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            <div style={{ flex: 1 }} />
            <Text text={maxTimeLabel} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
          </InlineFlexRow>
        </div>

        {/* サブコントロール */}
        <div className={`${className}__subControls`}>
          {isDetailOpen ? (
            <InlineFlexRow align={'center'} gap={4}>
              {PlaySpeed.map((value) => (
                <Button key={value} onClick={() => onChangePlaySpeed(value)} scheme={'none'} fontSize={'sm'}>
                  <Text text={`${value}x`} fontSize={'sm'} color={playSpeed === value ? theme.colors.text.primary : theme.colors.text.secondary} />
                </Button>
              ))}
            </InlineFlexRow>
          ) : (
            <Text text={`${playSpeed}x`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
          )}

          <Button onClick={() => setIsDetailOpen(!isDetailOpen)} scheme={'none'} fontSize={'base'}>
            {isDetailOpen ? <GrContract size={16} /> : <GrExpand size={16} />}
          </Button>

          {isDetailOpen && (
            <Button onClick={onClickMenu} scheme={'none'} fontSize={'lg'}>
              <IoMenu />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const TimelineControllerBlock = memo(
  styled(Component)`
    width: 95vw;
    max-width: 95vw;
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text.primary};
    border-radius: ${({ theme }) => theme.borders.radius.xl};

    @media (width >= 500px) and (orientation: portrait) {
      width: 600px;
      max-width: 600px;
    }

    @media (width >= 920px) {
      width: 600px;
      max-width: 600px;
    }

    /* スマホ横向き時は横並びレイアウト */
    @media (width <= 920px) and (orientation: landscape) {
      max-width: 60vw;
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    }

    &__content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;

      @media (width <= 920px) and (orientation: landscape) {
        flex-direction: row;
        gap: 12px;
        align-items: center;
      }
    }

    &__playControls {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: center;

      @media (width <= 920px) and (orientation: landscape) {
        gap: 8px;
        order: 1;
      }
    }

    &__sliderWrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;

      @media (width <= 920px) and (orientation: landscape) {
        flex: 1;
        order: 2;
      }
    }

    &__subControls {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;

      @media (width <= 920px) and (orientation: landscape) {
        display: none;
      }
    }

    &__seekBar {
      width: 100%;
      height: 20px;
      appearance: none;
      cursor: pointer;
      background: transparent;

      &::-webkit-slider-runnable-track {
        height: 4px;
        background: linear-gradient(
          to right,
          ${({ theme }) => theme.colors.primary.main} var(--progress, 0%),
          ${({ theme }) => theme.colors.background.default} var(--progress, 0%)
        );
        border-radius: 2px;
      }

      &::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
        margin-top: -4px;
        appearance: none;
        cursor: pointer;
        background: ${({ theme }) => theme.colors.primary.main};
        border-radius: 50%;
      }

      &::-moz-range-track {
        height: 4px;
        background: linear-gradient(
          to right,
          ${({ theme }) => theme.colors.primary.main} var(--progress, 0%),
          ${({ theme }) => theme.colors.background.default} var(--progress, 0%)
        );
        border-radius: 2px;
      }

      &::-moz-range-thumb {
        width: 12px;
        height: 12px;
        cursor: pointer;
        background: ${({ theme }) => theme.colors.primary.main};
        border: none;
        border-radius: 50%;
      }

      &:focus {
        outline: none;
      }

      &:focus-visible::-webkit-slider-thumb {
        outline: 2px solid ${({ theme }) => theme.colors.border.focus};
        outline-offset: 2px;
      }
    }

    &__seekTimes {
      width: 100%;
    }

    @media (width <= 500px) {
      &__seekBar {
        height: 28px;

        &::-webkit-slider-runnable-track {
          height: 6px;
        }

        &::-webkit-slider-thumb {
          width: 20px;
          height: 20px;
          margin-top: -7px;
        }

        &::-moz-range-track {
          height: 6px;
        }

        &::-moz-range-thumb {
          width: 20px;
          height: 20px;
        }
      }
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

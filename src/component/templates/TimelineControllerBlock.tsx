import styled from '@emotion/styled';
import { memo, useCallback, useMemo, useState } from 'react';
import { GrContract, GrExpand } from 'react-icons/gr';
import { IoMenu, IoPause, IoPlay, IoPlayBackSharp, IoPlayForwardSharp } from 'react-icons/io5';

import type { FC, ChangeEventHandler } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
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

  // 進捗割合を計算
  const progressPercent = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;

  // シークバーの進捗表示用グラデーション
  // thumbの中心位置に合わせる: CSS calc()で動的に計算
  const seekBarStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, ${theme.colors.primary.main} ${progressPercent}%, ${theme.colors.background.default} ${progressPercent}%)`,
    }),
    [progressPercent, theme.colors.primary.main, theme.colors.background.default],
  );

  return (
    <Card
      color={theme.colors.surface.base}
      className={`${className} ${isDetailOpen ? 'open' : ''}`}
      shadow='medium'
      border={theme.colors.border.default}
      stopPropagate
      blur
    >
      <InlineFlexColumn style={{ width: '100%' }} gap={8}>
        {/* 1行目: シークバー */}
        <div className={`${className}__sliderWrapper`}>
          <div className={`${className}__seekBarTrack`} style={seekBarStyle} />
          <input type='range' className={`${className}__seekBarInput`} min={0} max={maxTime} value={currentTime} onChange={handleSeek} />
          {/* 2行目: 時間表示（左右に小さく） */}
          <InlineFlexRow className={`${className}__seekTimes`} align={'center'} wrap={'nowrap'}>
            <Text className={`${className}__timeLabel`} text={currentTimeLabel} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            <div style={{ flex: 1 }} />
            <Text className={`${className}__timeLabel`} text={maxTimeLabel} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
          </InlineFlexRow>
        </div>

        {/* 3行目: 再生コントロール（中央・大きく） */}
        <InlineFlexRow className={`${className}__controlButtons`} align={'center'} gap={16} style={{ width: '100%', justifyContent: 'center' }} wrap={'nowrap'}>
          <Button className={`${className}__controlButton`} onClick={onClickBackFrame} scheme={'none'} fontSize={'lg'}>
            <IoPlayBackSharp />
          </Button>
          <Button className={`${className}__playButton`} onClick={onClickPlay} scheme={'none'} fontSize={'3xl'}>
            {isPlaying ? <IoPause size={36} /> : <IoPlay size={36} />}
          </Button>
          <Button className={`${className}__controlButton`} onClick={onClickForwardFrame} scheme={'none'} fontSize={'lg'}>
            <IoPlayForwardSharp />
          </Button>
        </InlineFlexRow>

        {/* 4行目: サブコントロール（中央） */}
        <InlineFlexRow align={'center'} gap={12} style={{ width: '100%', justifyContent: 'center' }} wrap={'nowrap'}>
          {/* 速度表示/選択 */}
          {isDetailOpen ? (
            <InlineFlexRow className={`${className}__speedButtons`} align={'center'} gap={4}>
              {PlaySpeed.map((value) => (
                <Button className={`${className}__speedButton`} key={value} onClick={() => onChangePlaySpeed(value)} scheme={'none'} fontSize={'sm'}>
                  <Text
                    className={`${className}__playSpeedText`}
                    text={`${value}x`}
                    fontSize={'sm'}
                    color={playSpeed === value ? theme.colors.text.primary : theme.colors.text.secondary}
                  />
                </Button>
              ))}
            </InlineFlexRow>
          ) : (
            <Text className={`${className}__speedLabel`} text={`${playSpeed}x`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
          )}

          {/* 展開/折りたたみボタン */}
          <Button
            className={`${className}__toggleButton ${isDetailOpen ? 'open' : ''}`}
            onClick={() => setIsDetailOpen(!isDetailOpen)}
            scheme={'none'}
            fontSize={'base'}
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

          {/* メニューボタン（展開時のみ） */}
          {isDetailOpen && (
            <Button className={`${className}__menuButton`} onClick={onClickMenu} scheme={'none'} fontSize={'lg'}>
              <IoMenu />
            </Button>
          )}
        </InlineFlexRow>
      </InlineFlexColumn>
    </Card>
  );
};

export const TimelineControllerBlock = memo(
  styled(Component)`
    max-width: 95vw;
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.text.primary};
    border-radius: ${({ theme }) => theme.borders.radius.xl};
    transition: all 0.2s ease-in-out;

    /* スマホ縦向き時はより広く、タップしやすく */
    @media (max-width: 500px) and (orientation: portrait) {
      width: 95vw;
      max-width: 95vw;
      padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
    }

    @media (width >= 500px) {
      width: 600px;
      max-width: 600px;
    }

    &__sliderWrapper {
      position: relative;
      width: 100%;
      height: ${({ theme }) => theme.spacing.lg};
    }

    &__seekTimes {
      position: absolute;
      bottom: -15px;
      left: 0;
      width: 100%;
    }

    /* シークバーのトラック背景 */
    &__seekBarTrack {
      position: absolute;
      top: 50%;
      left: 10px;
      width: calc(100% - 20px);
      height: 4px;
      border-radius: 2px;
      transform: translateY(-50%);
    }

    /* シークバースライダー */
    &__seekBarInput {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 20px;
      appearance: none;
      background: transparent;
      border: none;
      transform: translateY(-50%);

      &::-webkit-slider-runnable-track {
        height: 4px;
        background: transparent;
      }

      &::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
        margin-top: -4px;
        appearance: none;
        cursor: pointer;
        background: ${({ theme }) => theme.colors.primary.main};
        border: none;
        border-radius: 50%;
      }

      &::-moz-range-track {
        height: 4px;
        background: transparent;
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

      &:focus-visible::-moz-range-thumb {
        outline: 2px solid ${({ theme }) => theme.colors.border.focus};
        outline-offset: 2px;
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

    &__timeLabel {
      white-space: nowrap;
    }

    &__speedLabel {
      white-space: nowrap;
    }

    &__playSpeedText {
      transition: all 0.2s ease-in-out;
    }

    /* スマホ縦向き時のタップ領域改善 */
    @media (max-width: 500px) and (orientation: portrait) {
      &__controlButtons {
        gap: ${({ theme }) => theme.spacing.sm};
      }

      &__controlButton {
        min-width: 44px;
        min-height: 44px;
        padding: ${({ theme }) => theme.spacing.sm};
      }

      &__playButton {
        min-width: 48px;
        min-height: 48px;
        padding: ${({ theme }) => theme.spacing.sm};
      }

      &__speedButtons {
        gap: ${({ theme }) => theme.spacing.xs};
      }

      &__speedButton {
        min-width: 36px;
        min-height: 36px;
        padding: ${({ theme }) => theme.spacing.xs};
      }

      &__menuButton {
        min-width: 44px;
        min-height: 44px;
        padding: ${({ theme }) => theme.spacing.sm};
      }

      &__sliderWrapper {
        //min-height: 44px;
      }

      &__seekBarInput {
        &::-webkit-slider-thumb {
          width: 20px;
          height: 20px;
          margin-top: -8px;
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

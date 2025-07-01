import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';
import { BiPause, BiPlay } from 'react-icons/bi';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import type { FC, ChangeEventHandler } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type TimelineControllerBlockProps = {
  className?: string;
  isPlaying: boolean;
  currentTime: number;
  maxTime: number;
  onClickMenu: () => void;
  onClickPlay: () => void;
  onSeek: (time: number) => void;
};

const Component: FC<TimelineControllerBlockProps> = ({ className, isPlaying, maxTime = 0, currentTime, onClickPlay, onClickMenu, onSeek }) => {
  const { theme } = useSharedTheme();
  const [isMenusOpen, setIsMenusOpen] = useState(false);
  const handleSeekChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onSeek(Number(event.currentTarget.value)); // Convert percentage to ratio
    },
    [onSeek],
  );
  const currentRatio = maxTime > 0 ? currentTime / maxTime : 0;

  const currentTimeLabel = useMemo(() => {
    if (maxTime <= 0 || currentTime <= 0) {
      return '00:00:00';
    }
    const sec = currentTime / 1000;
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}:${String(Math.floor((sec % 1) * 100)).padStart(2, '0')}`;
  }, [currentTime, maxTime]);
  return (
    <Card color={theme.colors.surface.main} className={className} shadow={'medium'} border={theme.colors.border.main} stopPropagate>
      <InlineFlexColumn>
        {isMenusOpen && (
          <InlineFlexRow>
            <Button onClick={onClickMenu} scheme={'surface'} fontSize={'small'}>
              <IoEllipsisHorizontal />
            </Button>
            {/* Additional menu items can be added here */}
          </InlineFlexRow>
        )}
        <InlineFlexRow align={'center'} gap={12}>
          <Button onClick={onClickPlay} scheme={'primary'} fontSize={'small'}>
            {isPlaying ? <BiPause /> : <BiPlay />}
          </Button>
          <input
            className={`${className}__seekBarInput`}
            type={'range'}
            value={currentTime}
            onChange={handleSeekChange}
            min={0}
            max={maxTime}
            step={100}
            style={{
              // English comment: generate gradient background dynamically
              background: `linear-gradient(
                to right,
                ${theme.colors.primary.main} 0%,
                ${theme.colors.primary.main} ${currentRatio * 100}%,
                ${theme.colors.secondary.light} ${currentRatio * 100}%,
                ${theme.colors.secondary.light} 100%
              )`,
            }}
          />
          <div className={`${className}__time`}>{currentTimeLabel}</div>
          <Button onClick={onClickMenu} scheme={'surface'} fontSize={'small'}>
            <IoEllipsisHorizontal />
          </Button>
        </InlineFlexRow>
      </InlineFlexColumn>
    </Card>
  );
};

export const TimelineControllerBlock = styled(Component)`
  min-width: 300px;
  width: fit-content;
  padding: 16px;

  &__seekBarInput {
    flex: 1;
    min-width: 200px;
    height: 4px;
    padding: 0;
    margin: 8px 0;
    appearance: none;
    outline: none;
    background: ${({ theme }) => theme.colors.secondary.light};
    border-radius: 2px;

    &::-webkit-slider-thumb {
      width: 6px;
      height: 20px;
      appearance: none;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.main};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 8px;
      transition: background 0.3s;
    }

    &::-moz-range-thumb {
      width: 6px;
      height: 20px;
      appearance: none;
      cursor: pointer;
      background: ${({ theme }) => theme.colors.surface.main};
      border: 1px solid ${({ theme }) => theme.colors.primary.main};
      border-radius: 8px;
      transition: background 0.3s;
    }
  }
`;

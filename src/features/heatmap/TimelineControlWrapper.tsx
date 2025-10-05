import { memo, useCallback, useEffect, useState } from 'react';

import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { Dispatch, SetStateAction, FC, ComponentProps } from 'react';

import { type PlaySpeedType, TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';
import { usePlayerTimelinePatch, usePlayerTimelinePick, usePlayerTimelineSelect } from '@src/hooks/usePlayerTimeline';

export type TimelineControlWrapperProps = {
  setVisibleTimelineRange: Dispatch<SetStateAction<PlayerTimelinePointsTimeRange>>;
  visibleTimelineRange: PlayerTimelinePointsTimeRange;
  setOpenMenu: Dispatch<SetStateAction<string | undefined>>;
};

type ViewProps = Omit<ComponentProps<typeof TimelineControllerBlock>, 'currentTime'>;

const TimelineControllerView = memo((props: ViewProps) => {
  const currentTime = usePlayerTimelineSelect((s) => s.currentTimelineSeek);
  return <TimelineControllerBlock {...props} currentTime={currentTime} />;
});
TimelineControllerView.displayName = 'TimelineControllerView';

export const TimelineControlWrapper: FC<TimelineControlWrapperProps> = ({ setVisibleTimelineRange, visibleTimelineRange, setOpenMenu }) => {
  const { isPlaying, visible, maxTime } = usePlayerTimelinePick('isPlaying', 'visible', 'maxTime');
  const setTimelineState = usePlayerTimelinePatch();
  const [timelinePlaySpeed, setTimelinePlaySpeed] = useState<PlaySpeedType>(1);

  const setCurrentTimelineSeek = useCallback(
    (seek: number) => {
      setTimelineState({
        currentTimelineSeek: seek,
      });
    },
    [setTimelineState],
  );

  const onClickBackFrame = useCallback(() => {
    setTimelineState((prev) => ({
      currentTimelineSeek: Math.max(prev.currentTimelineSeek - 200 * timelinePlaySpeed, visibleTimelineRange.start),
    }));
  }, [setTimelineState, timelinePlaySpeed, visibleTimelineRange.start]);

  const onClickForwardFrame = useCallback(() => {
    setTimelineState((prev) => ({
      currentTimelineSeek: Math.min(prev.currentTimelineSeek + 200 * timelinePlaySpeed, visibleTimelineRange.end),
    }));
  }, [setTimelineState, timelinePlaySpeed, visibleTimelineRange.end]);

  useEffect(() => {
    setVisibleTimelineRange({ start: 0, end: maxTime });
  }, [maxTime, setVisibleTimelineRange]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTimelineState((prev) => {
          const prevSeek = prev.currentTimelineSeek;
          let seek: number;
          if (prevSeek < visibleTimelineRange.start || prevSeek >= visibleTimelineRange.end) {
            return {
              currentTimelineSeek: visibleTimelineRange.start,
            };
          }
          const nextSeek = prevSeek + timelinePlaySpeed * 100; // 1秒ごとに進める
          if (nextSeek > visibleTimelineRange.end) {
            clearInterval(interval);
            seek = visibleTimelineRange.start;
          } else {
            seek = nextSeek;
          }
          return {
            currentTimelineSeek: seek,
            isPlaying: nextSeek <= visibleTimelineRange.end,
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [setTimelineState, timelinePlaySpeed, isPlaying, visibleTimelineRange]);

  if (!visible) {
    return null;
  }
  return (
    <TimelineControllerView
      isPlaying={isPlaying}
      maxTime={maxTime}
      currentMinTime={visibleTimelineRange.start}
      currentMaxTime={visibleTimelineRange.end}
      playSpeed={timelinePlaySpeed}
      onChangePlaySpeed={setTimelinePlaySpeed}
      onChangeMinTime={(minTime) => {
        setVisibleTimelineRange((prev) => ({
          ...prev,
          start: minTime,
        }));
      }}
      onChangeMaxTime={(maxTime) => {
        setVisibleTimelineRange((prev) => ({
          ...prev,
          end: maxTime,
        }));
      }}
      onClickMenu={() => {
        setOpenMenu('playerTimeline');
      }}
      onClickPlay={() => {
        setTimelineState((prev) => ({
          ...prev,
          isPlaying: !isPlaying,
        }));
      }}
      onSeek={setCurrentTimelineSeek}
      onClickBackFrame={onClickBackFrame}
      onClickForwardFrame={onClickForwardFrame}
    />
  );
};

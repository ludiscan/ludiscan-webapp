import { memo, useCallback, useEffect, useState } from 'react';

import type { FC, ComponentProps } from 'react';

import { type PlaySpeedType, TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';
import { usePlayerTimelinePatch, usePlayerTimelinePick, usePlayerTimelineSelect } from '@src/hooks/usePlayerTimeline';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type ViewProps = Omit<ComponentProps<typeof TimelineControllerBlock>, 'currentTime'>;

const TimelineControllerView = memo(
  (props: ViewProps) => {
    const currentTime = usePlayerTimelineSelect((s) => s.currentTimelineSeek);
    return <TimelineControllerBlock {...props} currentTime={currentTime} />;
  },
  (prev, next) =>
    prev.isPlaying === next.isPlaying &&
    prev.maxTime === next.maxTime &&
    prev.currentMinTime === next.currentMinTime &&
    prev.currentMaxTime === next.currentMaxTime &&
    prev.playSpeed === next.playSpeed &&
    prev.onChangePlaySpeed === next.onChangePlaySpeed &&
    prev.onChangeMinTime === next.onChangeMinTime &&
    prev.onChangeMaxTime === next.onChangeMaxTime &&
    prev.onClickMenu === next.onClickMenu &&
    prev.onClickPlay === next.onClickPlay &&
    prev.onSeek === next.onSeek &&
    prev.onClickBackFrame === next.onClickBackFrame &&
    prev.onClickForwardFrame === next.onClickForwardFrame,
);
TimelineControllerView.displayName = 'TimelineControllerView';

export const TimelineControlWrapper: FC = () => {
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
      currentTimelineSeek: Math.max(prev.currentTimelineSeek - 200 * timelinePlaySpeed, 0),
    }));
  }, [setTimelineState, timelinePlaySpeed]);

  const onClickForwardFrame = useCallback(() => {
    setTimelineState((prev) => ({
      currentTimelineSeek: Math.min(prev.currentTimelineSeek + 200 * timelinePlaySpeed, prev.maxTime),
    }));
  }, [setTimelineState, timelinePlaySpeed]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setTimelineState((prev) => {
          const prevSeek = prev.currentTimelineSeek;
          let seek: number;
          if (prevSeek < 0 || prevSeek >= prev.maxTime) {
            return {
              currentTimelineSeek: 0,
            };
          }
          const nextSeek = prevSeek + timelinePlaySpeed * 100; // 1秒ごとに進める
          if (nextSeek > prev.maxTime) {
            clearInterval(interval);
            seek = 0;
          } else {
            seek = nextSeek;
          }
          return {
            currentTimelineSeek: seek,
            isPlaying: nextSeek <= prev.maxTime,
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [setTimelineState, timelinePlaySpeed, isPlaying]);

  if (!visible) {
    return null;
  }
  return (
    <TimelineControllerView
      isPlaying={isPlaying}
      maxTime={maxTime}
      currentMinTime={0}
      currentMaxTime={maxTime}
      playSpeed={timelinePlaySpeed}
      onChangePlaySpeed={setTimelinePlaySpeed}
      onChangeMinTime={() => {}}
      onChangeMaxTime={() => {}}
      onClickMenu={() => {
        heatMapEventBus.emit('click-menu-icon', { name: 'timeline' });
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

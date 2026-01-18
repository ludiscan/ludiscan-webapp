import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { FC, ComponentProps } from 'react';

import { type HeatmapOpacityType, type PlaySpeedType, TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';
import { useGeneralPatch, useGeneralPick } from '@src/hooks/useGeneral';
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
    prev.heatmapOpacity === next.heatmapOpacity &&
    prev.onChangePlaySpeed === next.onChangePlaySpeed &&
    prev.onChangeMinTime === next.onChangeMinTime &&
    prev.onChangeMaxTime === next.onChangeMaxTime &&
    prev.onClickMenu === next.onClickMenu &&
    prev.onClickPlay === next.onClickPlay &&
    prev.onSeek === next.onSeek &&
    prev.onClickBackFrame === next.onClickBackFrame &&
    prev.onClickForwardFrame === next.onClickForwardFrame &&
    prev.onToggleHeatmapOpacity === next.onToggleHeatmapOpacity,
);
TimelineControllerView.displayName = 'TimelineControllerView';

export const TimelineControlWrapper: FC = () => {
  const { isPlaying, visible, maxTime } = usePlayerTimelinePick('isPlaying', 'visible', 'maxTime');
  const setTimelineState = usePlayerTimelinePatch();
  const [timelinePlaySpeed, setTimelinePlaySpeed] = useState<PlaySpeedType>(1);

  // Opacity状態の取得・更新
  const { heatmapOpacity } = useGeneralPick('heatmapOpacity');
  const setGeneral = useGeneralPatch();

  // タイムラインが表示されるときにopacityを0.5に設定
  useEffect(() => {
    if (visible) {
      setGeneral({ heatmapOpacity: 0.5 });
    }
  }, [visible, setGeneral]);

  // スライダーで中間値が設定された場合の正規化
  const normalizedOpacity = useMemo((): HeatmapOpacityType => {
    if (heatmapOpacity <= 0.25) return 0;
    if (heatmapOpacity <= 0.75) return 0.5;
    return 1;
  }, [heatmapOpacity]);

  // Opacityトグルハンドラ: 0 → 0.5 → 1 → 0 の順でトグル
  const handleToggleOpacity = useCallback(() => {
    const nextOpacity = normalizedOpacity === 0 ? 0.5 : normalizedOpacity === 0.5 ? 1 : 0;
    setGeneral({ heatmapOpacity: nextOpacity });
  }, [normalizedOpacity, setGeneral]);

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
      heatmapOpacity={normalizedOpacity}
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
      onToggleHeatmapOpacity={handleToggleOpacity}
    />
  );
};

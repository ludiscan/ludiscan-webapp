import { useEffect, useMemo } from 'react';
import { Vector3 } from 'three';

import type { PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { useGeneralState, usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { usePlayerPositionLogs } from '@src/modeles/heatmapView';

export type PlayerTimelinePointsTimeRange = {
  start: number; // 開始時刻（ミリ秒）
  end: number; // 終了時刻（ミリ秒）
};
export type PlayerTimelinePointsProps = {
  service: HeatmapDataService;
  state: PlayerTimelineDetail | null;
  currentTimelineSeek: number;
  visibleTimeRange: PlayerTimelinePointsTimeRange;
};

const Component: FC<PlayerTimelinePointsProps> = ({ service, state, currentTimelineSeek, visibleTimeRange }) => {
  const {
    data: { upZ, scale },
  } = useGeneralState();
  const { data: timelineState, setData } = usePlayerTimelineState();
  const { data: fetchLogs, isLoading, isSuccess } = usePlayerPositionLogs(state?.player, state?.project_id, state?.session_id, service.createClient());
  const logs = useMemo(() => {
    if (!fetchLogs || !fetchLogs.data || fetchLogs.data.length === 0) return null;
    const points: Map<
      number,
      {
        x: number;
        y: number;
        z: number;
        offset_timestamp: number;
      }
    > = new Map();
    fetchLogs.data.forEach((pt) => {
      points.set(pt.offset_timestamp, {
        x: pt.x * scale,
        y: (upZ ? (pt.z ?? 0) : pt.y) * scale + 10,
        z: (upZ ? pt.y : (pt.z ?? 0)) * scale,
        offset_timestamp: pt.offset_timestamp,
      });
    });
    return points.values().toArray();
  }, [fetchLogs, scale, upZ]);
  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const max = logs ? Math.max(...logs.map((pt) => pt.offset_timestamp)) : 0;
    if (max > (timelineState.maxTime || 0)) {
      setData((prev) => ({
        ...prev,
        currantTime: 0,
        maxTime: max,
      }));
    }
  }, [logs, setData, timelineState]);
  if (isLoading || !logs || !isSuccess) return <></>;
  return (
    <>
      {logs.map((pt, idx) => (
        <mesh key={idx} position={new Vector3(pt.x, pt.y, pt.z)} /* eslint-disable-line react/no-unknown-property */>
          <sphereGeometry args={[15 * scale, 16, 16]} /* eslint-disable-line react/no-unknown-property */ />
          <meshStandardMaterial color='hotpink' transparent /* eslint-disable-line react/no-unknown-property */ />
        </mesh>
      ))}
    </>
  );
};

export const PlayerTimelinePoints = Component;

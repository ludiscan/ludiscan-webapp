import { useMemo } from 'react';
import { Vector3 } from 'three';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { useGeneralState, usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { usePlayerPositionLogs } from '@src/modeles/heatmapView';

export type PlayerTimelinePointsProps = {
  service: HeatmapDataService;
};

const Component: FC<PlayerTimelinePointsProps> = ({ service }) => {
  const { data: state } = usePlayerTimelineState();
  const {
    data: { upZ, scale },
  } = useGeneralState();
  const {
    data: fetchLogs,
    isLoading,
    isSuccess,
  } = usePlayerPositionLogs(state.detail?.player, state.detail?.project_id, state.detail?.session_id, service.createClient());
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

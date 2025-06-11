import { useQuery } from '@tanstack/react-query';
import { Vector3 } from 'three';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { useGeneralState } from '@src/hooks/useHeatmapState';

export type EventLogMarkersProps = {
  service: HeatmapDataService;
  logName: string;
  color: string;
};

const Component: FC<EventLogMarkersProps> = ({ logName, service, color }) => {
  const {
    data: { upZ = false },
  } = useGeneralState();
  const { data } = useQuery({
    queryKey: ['eventLogMarkers', logName],
    queryFn: async () => {
      return await service.getEventLog(logName);
    },
  });
  return (
    data &&
    data.map((d) => {
      const {
        event_data: { x, y, z },
        offset_timestamp,
      } = d;
      const position = upZ ? new Vector3(x, z, y) : new Vector3(x, y, z);
      return (
        <mesh
          key={offset_timestamp}
          position={position} /* eslint-disable-line react/no-unknown-property */
          castShadow={false} /* eslint-disable-line react/no-unknown-property */
          receiveShadow={false} /* eslint-disable-line react/no-unknown-property */
        >
          <sphereGeometry args={[40, 32]} /* eslint-disable-line react/no-unknown-property */ />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    })
  );
};

export const EventLogMarkers = Component;

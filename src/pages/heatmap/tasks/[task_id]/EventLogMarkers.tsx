import { useQuery } from '@tanstack/react-query';
import { Vector3 } from 'three';

import type { Env } from '@src/modeles/env';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { FC } from 'react';

import { useCanvasState } from '@src/hooks/useCanvasState';
import { createClient } from '@src/modeles/qeury';

export type EventLogMarkersProps = {
  env?: Env;
  task: HeatmapTask;
  logName: string;
  color: string;
};

async function getProjectLogs(env: Env, task: HeatmapTask, logName: string) {
  return await createClient(env).GET('/api/v0/projects/{id}/general_log/position/{event_type}', {
    params: {
      path: {
        id: task.project.id,
        event_type: logName,
      },
      query: {
        limit: 1000,
        offset: 0,
      },
    },
  });
}

async function getSessionLogs(env: Env, task: HeatmapTask, logName: string) {
  return await createClient(env).GET('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', {
    params: {
      path: {
        project_id: task.project.id,
        session_id: task.session?.sessionId || 0,
        event_type: logName,
      },
      query: {
        limit: 1000,
        offset: 0,
      },
    },
  });
}
const Component: FC<EventLogMarkersProps> = ({ logName, env, task, color }) => {
  const {
    general: { upZ },
  } = useCanvasState();
  const { data } = useQuery({
    queryKey: ['eventLogMarkers', logName, env, task],
    queryFn: async () => {
      if (!env) return null;
      // Fetch event log markers data from the server
      const { data, error } = task.session ? await getSessionLogs(env, task, logName) : await getProjectLogs(env, task, logName);
      if (error) throw error;
      return data;
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

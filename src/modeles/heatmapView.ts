import { useQuery } from '@tanstack/react-query';

import packageJson from '../../package.json';

import type { paths } from '@generated/api';
import type { Client } from 'openapi-fetch';

import { DefaultStaleTime } from '@src/modeles/qeury';

export type EventLogData = {
  key: string;
  visible: boolean;
  color: string;
  iconName: string;
};

export type GeneralSettings = {
  upZ: boolean;
  scale: number;
  showHeatmap: boolean;
  blockSize: number;
  mapName: string;
  minThreshold: number;
  maxThreshold: number;
};
export type HotspotModeSettings = {
  visible: boolean;
  cellRadius: number;
  thresholdCount: number;
  skipNearDuplication: boolean;
};

export type PlayerTimelineDetail = {
  player: number;
  project_id: number;
  session_id: number;
  visible: boolean;
};

export type PlayerTimelineSettings = {
  visible: boolean;
  details: PlayerTimelineDetail[] | null;
};

export type HeatmapStates = {
  general: GeneralSettings;
  hotspotMode: HotspotModeSettings;
  eventLogs: EventLogData[];
  playerTimeline: PlayerTimelineSettings;
};

// Canvas の状態の型定義
export type HeatmapDataState = HeatmapStates & {
  version?: string;
};

export const initializeValues: HeatmapDataState = {
  version: packageJson.version,
  general: {
    upZ: true,
    scale: 1,
    showHeatmap: false,
    blockSize: 1,
    mapName: '',
    minThreshold: 0.0,
    maxThreshold: 1,
  },
  hotspotMode: {
    visible: false,
    cellRadius: 400,
    thresholdCount: 6,
    skipNearDuplication: true,
  },
  eventLogs: [],
  playerTimeline: {
    visible: false,
    details: null,
  },
};

export function usePlayerPositionLogs(
  player: number | undefined,
  project_id: number | undefined,
  session_id: number | undefined,
  client: Client<paths, `${string}/${string}`> | null,
) {
  return useQuery({
    queryKey: ['eventLogDetail', player, project_id, session_id, client],
    queryFn: async () => {
      if (!project_id || !session_id || player === undefined || !client) return null;
      // Replace with actual data fetching logic
      return client.GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log', {
        params: {
          path: {
            project_id: project_id,
            session_id: session_id,
          },
          query: {
            player: player,
            limit: 1000, // Assuming we want the latest log for the player
            offset: 0,
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!project_id && !!session_id && player !== undefined,
  });
}

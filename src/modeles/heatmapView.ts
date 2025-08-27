import { useQuery } from '@tanstack/react-query';

import packageJson from '../../package.json';

import type { components, paths } from '@generated/api';
import type { Client } from 'openapi-fetch';

import { DefaultStaleTime } from '@src/modeles/qeury';

export type EventLogData = {
  key: string;
  visible: boolean;
  color: string;
  iconName: string;
};

export type EventLogSettings = {
  visible: boolean;
  logs: EventLogData[];
  filters: Record<string, boolean | number>;
};

export type GeneralSettings = {
  upZ: boolean;
  scale: number;
  showHeatmap: boolean;
  heatmapOpacity: number;
  heatmapType: 'object' | 'fill';
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
  isPlaying: boolean;
  maxTime: number;
  queryText: string;
};

export type HeatmapStates = {
  general: GeneralSettings;
  hotspotMode: HotspotModeSettings;
  eventLog: EventLogSettings;
  playerTimeline: PlayerTimelineSettings;
};

// Canvas の状態の型定義
export type HeatmapDataState = HeatmapStates & {
  version?: string;
};

export type PlayerPositionLog = Omit<components['schemas']['PlayPositionLogDto'], 'location' | 'z'> & {
  z: number; // z座標を明示的に定義
};

export const initializeValues: HeatmapDataState = {
  version: packageJson.version,
  general: {
    upZ: true,
    scale: 0.5,
    showHeatmap: true,
    heatmapOpacity: 1.0,
    heatmapType: 'object',
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
  eventLog: {
    visible: false,
    logs: [],
    filters: {},
  },
  playerTimeline: {
    visible: false,
    details: null,
    isPlaying: false,
    maxTime: 0,
    queryText: '',
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

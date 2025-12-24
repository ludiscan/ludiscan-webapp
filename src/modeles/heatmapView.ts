import { useQuery } from '@tanstack/react-query';

import packageJson from '../../package.json';

import type { components } from '@generated/api';

import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';

export type EventLogData = {
  key: string;
  visible: boolean;
  color: string;
  iconName: string;
  hvqlScript?: string; // Optional HVQL script for dynamic icon/style based on event metadata
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
  sessionId: number | null;
  heatmapOpacity: number;
  heatmapType: 'object' | 'fill';
  blockSize: number;
  mapName: string;
  minThreshold: number;
  maxThreshold: number;
  colorScale: number;
  displayIntensity: number; // 0-100: 表示量の簡易調整（minThresholdとcolorScaleを自動計算）
  sessionHeatmap: boolean;
  dimensionalityOverride: '2d' | '3d' | null; // ユーザーによる2D/3Dモード切り替え（nullの場合はproject.is2Dに従う）
  showMapIn2D: boolean; // 2Dモードでもマップ（3Dモデル）を表示するかどうか
  showShadow: boolean; // AO風の接地影を表示するかどうか
  showStats: boolean; // FPS統計を表示するかどうか
  backgroundImage: string | null; // ユーザーが選択した背景画像のData URL
  backgroundScale: number; // 背景画像のスケール（1.0 = 100%）
  backgroundOffsetX: number; // 背景画像のX方向オフセット（-100 ~ 100）
  backgroundOffsetY: number; // 背景画像のY方向オフセット（-100 ~ 100）
  // OBJモデルの位置調整
  modelPositionX: number;
  modelPositionY: number;
  modelPositionZ: number;
  // OBJモデルの回転調整（度数法）
  modelRotationX: number;
  modelRotationY: number;
  modelRotationZ: number;
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
  currentTimelineSeek: number;
};

export type FieldObjectData = {
  objectType: string;
  visible: boolean;
  color: string;
  iconName: string;
  hvqlScript?: string; // Optional HVQL script for dynamic icon/style based on object metadata
};

export type FieldObjectSettings = {
  visible: boolean;
  objects: FieldObjectData[];
  filters: Record<string, boolean | number>;
  queryText: string; // HVQL query for dynamic object styling/icons
};

export type SplitModeSettings = {
  enabled: boolean;
  direction: 'horizontal' | 'vertical';
};

export type HeatmapStates = {
  general: GeneralSettings;
  hotspotMode: HotspotModeSettings;
  eventLog: EventLogSettings;
  playerTimeline: PlayerTimelineSettings;
  fieldObject: FieldObjectSettings;
  splitMode: SplitModeSettings;
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
    sessionId: null,
    heatmapOpacity: 1.0,
    heatmapType: 'object',
    blockSize: 1,
    mapName: '',
    minThreshold: 0.0,
    maxThreshold: 1,
    colorScale: 1.0,
    displayIntensity: 50, // 表示量（0-100）、50がデフォルト
    sessionHeatmap: false,
    dimensionalityOverride: null, // 初期状態ではproject.is2Dに従う
    showMapIn2D: false, // 2Dモードでもマップを表示するか（初期値はOFF）
    showShadow: true, // AO風の接地影（初期値はON）
    showStats: false, // FPS統計（初期値はOFF）
    backgroundImage: null, // ユーザーが選択した背景画像（初期状態はなし）
    backgroundScale: 1.0, // 背景画像のスケール（初期値は100%）
    backgroundOffsetX: 0, // 背景画像のXオフセット（初期値は中央）
    backgroundOffsetY: 0, // 背景画像のYオフセット（初期値は中央）
    modelPositionX: 0, // OBJモデルのX位置
    modelPositionY: 0, // OBJモデルのY位置
    modelPositionZ: 0, // OBJモデルのZ位置
    modelRotationX: 0, // OBJモデルのX回転（度）
    modelRotationY: 0, // OBJモデルのY回転（度）
    modelRotationZ: 0, // OBJモデルのZ回転（度）
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
    currentTimelineSeek: 0,
  },
  fieldObject: {
    visible: false,
    objects: [],
    filters: {},
    queryText: '',
  },
  splitMode: {
    enabled: false,
    direction: 'horizontal',
  },
};

export function usePlayerPositionLogs(player: number | undefined, project_id: number | undefined, session_id: number | undefined) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['eventLogDetail', player, project_id, session_id, apiClient],
    queryFn: async () => {
      if (!project_id || !session_id || player === undefined) return null;
      // Replace with actual data fetching logic
      return apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log', {
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

export function useFieldObjectTypes(project_id: number | undefined, session_id: number | undefined) {
  const apiClient = useApiClient();
  return useQuery({
    queryKey: ['fieldObjectTypes', project_id, session_id, apiClient],
    queryFn: async () => {
      if (!project_id || !session_id) return null;
      return apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/field_object_log/object_types', {
        params: {
          path: {
            project_id: project_id,
            session_id: session_id,
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!project_id && !!session_id,
  });
}

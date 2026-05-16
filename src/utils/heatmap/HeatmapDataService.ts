import { useCallback, useState } from 'react';

import { useHeatmapDataFetchers } from './hooks/useHeatmapDataFetchers';
import { useHeatmapTask } from './hooks/useHeatmapTask';

import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { Project } from '@src/modeles/project';
import type { Session } from '@src/modeles/session';

import { useAuth } from '@src/hooks/useAuth';
import { useApiClient } from '@src/modeles/ApiClientContext';

// セッション検索パラメータ
export type SessionSearchParams = {
  q?: string; // 統合検索クエリ
  deviceId?: string;
  platform?: string;
  isPlaying?: boolean;
  limit?: number;
  offset?: number;
};

// Field object log type (matches API response)
export type FieldObjectLog = {
  object_id: string;
  object_type: string;
  x: number;
  y: number;
  z?: number | null;
  offset_timestamp: number;
  event_type: 'spawn' | 'move' | 'despawn' | 'update';
  status?: Record<string, never> | null;
};

// Player type (matches API response)
export type Player = {
  playerId: string;
  playerName: string;
};

// マップコンテンツの取得結果
export type MapContentResult = {
  data: ArrayBuffer;
  fileType: ModelFileType | null;
};

// HeatmapViewer用のデータ取得インターフェース
export type HeatmapDataService = {
  isInitialized: boolean;
  // embed経由でのアクセスかどうか（trueの場合、一部の機能が制限される）
  isEmbed?: boolean;
  // embedトークンに紐づいた元のsessionId（フィルター用、embed時のみ）
  embedSessionId?: number;
  // マップリストの取得（activeOnly: trueの場合、マップデータがアップロード済みのマップのみを返す）
  getMapList(activeOnly?: boolean): Promise<string[]>;

  // マップデータの取得
  getMapContent(mapName: string): Promise<MapContentResult | null>;

  // イベントログキーの取得
  getGeneralLogKeys(): Promise<string[] | null>;

  task: HeatmapTask | undefined;

  getEventLog(logName: string): Promise<PositionEventLog[] | null>;

  getEventLogSnapshot(logName: string): PositionEventLog[] | null;

  projectId: number | undefined;

  sessionId: number | null;
  setSessionId: (sessionId: number | null) => void;

  sessionHeatmapIds: number[] | undefined;
  setSessionHeatmapIds: (sessionIds: number[] | undefined) => void;

  // Load existing task by ID
  loadTask: (taskId: number) => void;

  // New methods for centralized data access
  getProject(): Promise<Project | null>;
  getSession(): Promise<Session | null>;
  getSessions(limit?: number, offset?: number): Promise<Session[]>;
  searchSessions(params: SessionSearchParams): Promise<Session[]>;
  getPlayers(): Promise<Player[]>;
  getFieldObjectLogs(): Promise<FieldObjectLog[]>;
};

export const mockHeatmapDataService: HeatmapDataService = {
  isInitialized: true,
  getMapList: async (_activeOnly?: boolean) => ['map1', 'map2', 'map3'],
  getMapContent: async () => null,
  getGeneralLogKeys: async () => ['key1', 'key2', 'key3'],
  task: undefined,
  getEventLog: async () => [],
  getEventLogSnapshot: () => [],
  projectId: 1,
  sessionId: null,
  setSessionId: () => {},
  sessionHeatmapIds: undefined,
  setSessionHeatmapIds: () => {},
  loadTask: () => {},
  getProject: async () => null,
  getSession: async () => null,
  getSessions: async () => [],
  searchSessions: async () => [],
  getPlayers: async () => [],
  getFieldObjectLogs: async () => [],
};

// データ型定義
export type OfflineHeatmapData = {
  task: HeatmapTask;
  canvasState: HeatmapStates;
  mapList: string[];
  mapContentBase64: string | null; // mapFileNameをmapContentBase64に変更（Base64エンコードされたモデルデータ）
  generalLogKeys: string[] | null;
  eventLogs: Record<string, PositionEventLog[]>;
};

// 通常のオンライン環境用の実装
export function useOnlineHeatmapDataService(projectId: number | undefined, initialTaskId: number | null, sessionHeatmap: boolean): HeatmapDataService {
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionHeatmapIds, setSessionHeatmapIds] = useState<number[] | undefined>(undefined);
  const [stepSize] = useState<number>(50);

  const { isAuthorized, ready } = useAuth();
  const apiClient = useApiClient();

  const { task } = useHeatmapTask(apiClient, isAuthorized, projectId, sessionId, taskId, setTaskId, sessionHeatmap, sessionHeatmapIds, stepSize, initialTaskId);

  const fetchers = useHeatmapDataFetchers(apiClient, projectId, sessionId);

  const loadTask = useCallback(
    (newTaskId: number) => {
      setTaskId(newTaskId);
      // タスクを直接選択した場合はフィルターを解除
      setSessionHeatmapIds(undefined);
    },
    [setTaskId],
  );

  return {
    isInitialized: isAuthorized && ready && projectId !== undefined,
    ...fetchers,
    task,
    projectId,
    sessionId,
    setSessionId,
    sessionHeatmapIds,
    setSessionHeatmapIds,
    loadTask,
  };
}

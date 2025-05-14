import { useCallback, useState } from 'react';

import type { Env } from '@src/modeles/env';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { CanvasEventValues } from '@src/slices/canvasSlice';

import { createClient } from '@src/modeles/qeury';

// HeatmapViewer用のデータ取得インターフェース
export type HeatmapDataService = {
  isInitialized: boolean;
  // マップリストの取得
  getMapList(): Promise<string[]>;

  // マップデータの取得
  getMapContent(mapName: string): Promise<ArrayBuffer | null>;

  // イベントログキーの取得
  getGeneralLogKeys(): Promise<string[] | null>;

  getTask(): HeatmapTask | null;

  getEventLog(logName: string): Promise<PositionEventLog[] | null>;

  eventLogs: Record<string, PositionEventLog[]>;
};

// データ型定義
export type OfflineHeatmapData = {
  task: HeatmapTask;
  canvasState: CanvasEventValues;
  mapList: string[];
  mapContentBase64: string | null; // mapFileNameをmapContentBase64に変更（Base64エンコードされたモデルデータ）
  generalLogKeys: string[] | null;
  eventLogs: Record<string, PositionEventLog[]>;
};

// 通常のオンライン環境用の実装
export function useOnlineHeatmapDataService(env: Env | undefined, task: HeatmapTask | null | undefined): HeatmapDataService {
  const [eventLogs, setEventLogs] = useState<Record<string, PositionEventLog[]>>({});

  const getMapList = useCallback(async () => {
    try {
      if (!task || !env) {
        return [];
      }
      const { data, error } = await createClient(env).GET('/api/v0/heatmap/tasks/{task_id}/maps', {
        params: {
          path: {
            task_id: Number(task.taskId),
          },
        },
      });
      if (error) throw error;
      return data?.maps || [];
    } catch {
      return [];
    }
  }, [env, task]);

  const getMapContent = useCallback(
    async (mapName: string) => {
      try {
        if (!task || !env) {
          return null;
        }
        const { data, error } = await createClient(env).GET('/api/v0/heatmap/map_data/{map_name}', {
          params: {
            path: {
              map_name: mapName,
            },
          },
          parseAs: 'arrayBuffer',
        });
        if (error) throw error;
        return data;
      } catch {
        return null;
      }
    },
    [env, task],
  );

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (!task || !env) {
        return null;
      }
      const projectId = Number(task.project.id);
      const sessionId = task.session?.sessionId ? Number(task.session.sessionId) : undefined;

      const { data, error } = await createClient(env).GET('/api/v0/general_log/position/keys', {
        params: {
          query: {
            project_id: projectId,
            session_id: sessionId,
          },
        },
      });
      if (error) throw error;
      return data.keys;
    } catch {
      return null;
    }
  }, [env, task]);

  const getTask = useCallback(() => {
    return task ? task : null;
  }, [task]);

  const getProjectLogs = useCallback(
    async (logName: string) => {
      if (!env || !task) return null;
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
    },
    [env, task],
  );

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!env || !task) return null;
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
    },
    [env, task],
  );

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      if (!env || !task) return null;
      // Fetch event log markers data from the server
      const res = task.session ? await getSessionLogs(logName) : await getProjectLogs(logName);
      if (res?.error) throw res.error;
      if (res?.data) {
        setEventLogs((prev) => ({
          ...prev,
          [logName]: res.data,
        }));
      }
      return res?.data || null;
    },
    [env, task, getSessionLogs, getProjectLogs],
  );

  return {
    isInitialized: env != null && task != null,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    getTask,
    getEventLog,
    eventLogs,
  };
}

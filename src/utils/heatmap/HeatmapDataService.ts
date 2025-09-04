import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';

import { useAuth } from '@src/hooks/useAuth';
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

  task: HeatmapTask | undefined;

  getEventLog(logName: string): Promise<PositionEventLog[] | null>;

  eventLogs: Record<string, PositionEventLog[]>;

  projectId: number | undefined;
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
export function useOnlineHeatmapDataService(projectId: number | undefined, initialTaskId: number | null): HeatmapDataService {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const [eventLogs, setEventLogs] = useState<Record<string, PositionEventLog[]>>({});
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);

  const { isAuthorized, isLoading, ready } = useAuth();

  const { data: task, refetch: refetchTask } = useQuery({
    queryKey: ['heatmap', taskId, isAuthorized],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId))) return null;
      if (!isAuthorized) return null;
      const { data, error } = await createClient().GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) throw error;
      return data;
    },
    initialData: null,
    enabled: taskId !== null && isAuthorized,
  });

  useEffect(() => {
    if (!task) return;

    if (task.status === 'pending' || task.status === 'processing') {
      timer.current = setInterval(() => {
        refetchTask().then(() => {});
      }, 500);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [refetchTask, task]);

  const getMapList = useCallback(async () => {
    try {
      if (!task) {
        return [];
      }
      const { data, error } = await createClient().GET('/api/v0/heatmap/tasks/{task_id}/maps', {
        params: {
          path: {
            task_id: Number(task.taskId),
          },
        },
      });
      if (error) return [];
      return data?.maps || [];
    } catch {
      return [];
    }
  }, [task]);

  const getMapContent = useCallback(
    async (mapName: string) => {
      try {
        if (!task) {
          return null;
        }
        const { data, error } = await createClient().GET('/api/v0/heatmap/map_data/{map_name}', {
          params: {
            path: {
              map_name: mapName,
            },
          },
          parseAs: 'arrayBuffer',
        });
        if (error) return null;
        return data;
      } catch {
        return null;
      }
    },
    [task],
  );

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (!task) {
        return null;
      }
      const projectId = Number(task.project.id);
      const sessionId = task.session?.sessionId ? Number(task.session.sessionId) : undefined;

      const { data, error } = await createClient().GET('/api/v0/general_log/position/keys', {
        params: {
          query: {
            project_id: projectId,
            session_id: sessionId,
          },
        },
      });
      if (error) return null;
      return data.keys;
    } catch {
      return null;
    }
  }, [task]);

  const getProjectLogs = useCallback(
    async (logName: string) => {
      if (!task) return null;
      return await createClient().GET('/api/v0/projects/{id}/general_log/position/{event_type}', {
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
    [task],
  );

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!task) return null;
      return await createClient().GET('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', {
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
    [task],
  );

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      if (!task) return null;
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
    [task, getSessionLogs, getProjectLogs],
  );

  return {
    isInitialized: isAuthorized && ready && projectId !== undefined,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    task: task || undefined,
    getEventLog,
    eventLogs,
    projectId,
  };
}

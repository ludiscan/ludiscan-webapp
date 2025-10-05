import { useQuery, useQueryClient } from '@tanstack/react-query';
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

  getEventLogSnapshot(logName: string): PositionEventLog[] | null;

  projectId: number | undefined;

  sessionId: number | null;
  setSessionId: (sessionId: number | null) => void;
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

async function sessionCreateTask(projectId: number, sessionId: number, stepSize: number, zVisible: boolean) {
  return await createClient().POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
    params: {
      path: {
        project_id: projectId,
        session_id: sessionId,
      },
    },
    body: {
      stepSize: stepSize,
      zVisible: zVisible,
    },
  });
}

async function projectCreateTask(projectId: number, stepSize: number, zVisible: boolean) {
  return await createClient().POST('/api/v0/heatmap/projects/{project_id}/tasks', {
    params: {
      path: {
        project_id: projectId,
      },
    },
    body: {
      stepSize: stepSize,
      zVisible: zVisible,
    },
  });
}

// 通常のオンライン環境用の実装
export function useOnlineHeatmapDataService(projectId: number | undefined, initialTaskId: number | null, sessionHeatmap: boolean): HeatmapDataService {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [stepSize] = useState<number>(50);
  const [zVisible] = useState<boolean>(true);

  const { isAuthorized, ready } = useAuth();
  const queryClient = useQueryClient();

  const { data: createdTask } = useQuery({
    queryKey: [projectId, sessionId, stepSize, zVisible, sessionHeatmap],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!projectId) {
        return null;
      }

      const { data, error } =
        sessionHeatmap && sessionId && sessionId !== 0
          ? await sessionCreateTask(projectId, sessionId, stepSize, zVisible)
          : await projectCreateTask(projectId, stepSize, zVisible);
      if (error) throw error;
      return data;
    },
    enabled: isAuthorized && projectId !== undefined && projectId !== 0 && initialTaskId === null,
    retry: 3,
  });

  useEffect(() => {
    if (!createdTask) return;
    setTaskId(createdTask.taskId);
  }, [createdTask]);

  const { data: task } = useQuery({
    queryKey: ['heatmap', isAuthorized, taskId],
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
      timer.current = setInterval(async () => {
        await queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      }, 500);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [queryClient, task]);

  const getMapList = useCallback(async () => {
    try {
      if (!projectId) {
        return [];
      }
      const { data, error } = await createClient().GET('/api/v0.1/projects/{project_id}/maps', {
        params: {
          path: {
            project_id: Number(projectId),
          },
        },
      });
      if (error) return [];
      return data.maps || [];
    } catch {
      return [];
    }
  }, [projectId]);

  const getMapContent = useCallback(async (mapName: string) => {
    try {
      if (!mapName || mapName === '') return null;
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
  }, []);

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (projectId === undefined) return null;

      const { data, error } = await createClient().GET('/api/v0/general_log/position/keys', {
        params: {
          query: {
            project_id: projectId,
            session_id: sessionId ?? undefined,
          },
        },
      });
      if (error) return null;
      return data.keys;
    } catch {
      return null;
    }
  }, [projectId, sessionId]);

  const getProjectLogs = useCallback(
    async (logName: string) => {
      if (!projectId) return null;
      return await createClient().GET('/api/v0/projects/{id}/general_log/position/{event_type}', {
        params: {
          path: {
            id: projectId,
            event_type: logName,
          },
          query: {
            limit: 1000,
            offset: 0,
          },
        },
      });
    },
    [projectId],
  );

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!projectId || !sessionId) return null;
      return await createClient().GET('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', {
        params: {
          path: {
            project_id: projectId,
            session_id: sessionId,
            event_type: logName,
          },
          query: {
            limit: 1000,
            offset: 0,
          },
        },
      });
    },
    [projectId, sessionId],
  );
  const eventLogKey = (projectId: number | undefined, sessionId: number | null, logName: string) =>
    ['eventLog', projectId ?? 0, sessionId ?? 0, logName] as const;

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      const res = sessionId ? await getSessionLogs(logName) : await getProjectLogs(logName);
      if (res?.error) throw res.error;
      const data = res?.data ?? null;
      if (data) {
        queryClient.setQueryData(eventLogKey(projectId, sessionId, logName), data);
      }
      return data;
    },
    [projectId, sessionId, getSessionLogs, getProjectLogs, queryClient],
  );

  const getEventLogSnapshot = useCallback(
    (logName: string): PositionEventLog[] | null => {
      return (queryClient.getQueryData(eventLogKey(projectId, sessionId, logName)) as PositionEventLog[] | undefined) ?? null;
    },
    [projectId, sessionId, queryClient],
  );

  return {
    isInitialized: isAuthorized && ready && projectId !== undefined,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    task: task || createdTask || undefined,
    getEventLog,
    getEventLogSnapshot,
    projectId,
    sessionId,
    setSessionId,
  };
}

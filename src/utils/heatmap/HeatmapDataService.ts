import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { Project } from '@src/modeles/project';
import type { createClient } from '@src/modeles/qeury';
import type { Session } from '@src/modeles/session';

import { useAuth } from '@src/hooks/useAuth';
import { useApiClient } from '@src/modeles/ApiClientContext';

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

  sessionHeatmapIds: number[] | undefined;
  setSessionHeatmapIds: (sessionIds: number[] | undefined) => void;

  // Load existing task by ID
  loadTask: (taskId: number) => void;

  // New methods for centralized data access
  getProject(): Promise<Project | null>;
  getSession(): Promise<Session | null>;
  getSessions(limit?: number, offset?: number): Promise<Session[]>;
  getPlayers(): Promise<Player[]>;
  getFieldObjectLogs(): Promise<FieldObjectLog[]>;
};

export const mockHeatmapDataService: HeatmapDataService = {
  isInitialized: true,
  getMapList: async () => ['map1', 'map2', 'map3'],
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

async function sessionCreateTask(apiClient: ReturnType<typeof createClient>, projectId: number, sessionId: number, stepSize: number, zVisible: boolean) {
  return await apiClient.POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
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

async function projectCreateTask(apiClient: ReturnType<typeof createClient>, projectId: number, stepSize: number, zVisible: boolean, sessionIds?: number[]) {
  return await apiClient.POST('/api/v0/heatmap/projects/{project_id}/tasks', {
    params: {
      path: {
        project_id: projectId,
      },
    },
    body: {
      stepSize: stepSize,
      zVisible: zVisible,
      ...(sessionIds && sessionIds.length > 0 ? { sessionIds } : {}),
    },
  });
}

// 通常のオンライン環境用の実装
export function useOnlineHeatmapDataService(projectId: number | undefined, initialTaskId: number | null, sessionHeatmap: boolean): HeatmapDataService {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionHeatmapIds, setSessionHeatmapIds] = useState<number[] | undefined>(undefined);
  const [stepSize] = useState<number>(50);

  const { isAuthorized, ready } = useAuth();
  const queryClient = useQueryClient();
  const apiClient = useApiClient();

  // プロジェクトデータを取得してis2Dフラグを取得
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: projectId } },
      });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5分
    enabled: !!projectId && isAuthorized,
  });

  // is2Dフラグに基づいてzVisibleを動的に決定（2Dの場合はzVisible=false）
  const zVisible = !(project?.is2D ?? false);

  const { data: createdTask } = useQuery({
    queryKey: [projectId, sessionId, stepSize, zVisible, sessionHeatmap, sessionHeatmapIds, apiClient],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!projectId) {
        return null;
      }

      const { data, error } =
        sessionHeatmap && sessionId && sessionId !== 0
          ? await sessionCreateTask(apiClient, projectId, sessionId, stepSize, zVisible)
          : await projectCreateTask(apiClient, projectId, stepSize, zVisible, sessionHeatmapIds);
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
      const { data, error } = await apiClient.GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) throw error;
      return data;
    },
    initialData: null,
    enabled: taskId !== null && isAuthorized,
    // apiClientは関数なので、依存配列に含めない（Contextから毎回取得されるため）
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
      const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/maps', {
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
  }, [projectId, apiClient]);

  const getMapContent = useCallback(
    async (mapName: string) => {
      try {
        if (!mapName || mapName === '') return null;
        const { data, error } = await apiClient.GET('/api/v0/heatmap/map_data/{map_name}', {
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
    [apiClient],
  );

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (projectId === undefined) return null;

      const { data, error } = await apiClient.GET('/api/v0/general_log/position/keys', {
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
  }, [projectId, sessionId, apiClient]);

  const getProjectLogs = useCallback(
    async (logName: string) => {
      if (!projectId) return null;
      return await apiClient.GET('/api/v0/projects/{id}/general_log/position/{event_type}', {
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
    [projectId, apiClient],
  );

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!projectId || !sessionId) return null;
      return await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', {
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
    [projectId, sessionId, apiClient],
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

  const getProject = useCallback(async () => {
    if (!projectId) return null;
    const res = await apiClient.GET('/api/v0/projects/{id}', {
      params: { path: { id: projectId } },
    });
    return res.data ?? null;
  }, [projectId, apiClient]);

  const getSession = useCallback(async () => {
    if (!projectId || !sessionId) return null;
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}', {
      params: { path: { project_id: projectId, session_id: sessionId } },
    });
    return res.data ?? null;
  }, [projectId, sessionId, apiClient]);

  const getSessions = useCallback(
    async (limit = 100, offset = 0) => {
      if (!projectId) return [];
      const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session', {
        params: { path: { project_id: projectId }, query: { limit, offset } },
      });
      return (res.data as Session[]) ?? [];
    },
    [projectId, apiClient],
  );

  const getPlayers = useCallback(async () => {
    if (!projectId || !sessionId) return [];
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
      params: { path: { project_id: projectId, session_id: sessionId } },
    });
    return (res.data as unknown as Player[]) ?? [];
  }, [projectId, sessionId, apiClient]);

  const getFieldObjectLogs = useCallback(async () => {
    if (!projectId || !sessionId) return [];
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/field_object_log', {
      params: { path: { project_id: projectId, session_id: sessionId } },
    });
    return (res.data as unknown as FieldObjectLog[]) ?? [];
  }, [projectId, sessionId, apiClient]);

  const loadTask = useCallback(
    (newTaskId: number) => {
      setTaskId(newTaskId);
    },
    [setTaskId],
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
    sessionHeatmapIds,
    setSessionHeatmapIds,
    loadTask,
    getProject,
    getSession,
    getSessions,
    getPlayers,
    getFieldObjectLogs,
  };
}

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { HeatmapDataService } from './HeatmapDataService';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';

import { env } from '@src/config/env';

/**
 * Embed用のHeatmapDataService
 * トークンベースの認証を使用し、通常のセッション認証をバイパス
 */

type EmbedApiResponse<T> = {
  data?: T;
  error?: { message: string };
};

async function embedFetch<T>(endpoint: string, token: string, options?: RequestInit): Promise<EmbedApiResponse<T>> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Embed-Token': token,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      return { error: { message: `HTTP ${response.status}` } };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : 'Unknown error' } };
  }
}

async function embedFetchArrayBuffer(endpoint: string, token: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`, {
      headers: {
        'X-Embed-Token': token,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function sessionCreateTask(token: string, projectId: number, sessionId: number, stepSize: number, zVisible: boolean) {
  return await embedFetch<HeatmapTask>(`/api/v0/heatmap/projects/${projectId}/play_session/${sessionId}/tasks`, token, {
    method: 'POST',
    body: JSON.stringify({ stepSize, zVisible }),
  });
}

type ProjectResponse = {
  id: number;
  name: string;
  is2D: boolean;
};

type MapListResponse = {
  maps: string[];
};

type LogKeysResponse = {
  keys: string[];
};

export function useEmbedHeatmapDataService(projectId: number | undefined, sessionId: number | undefined, token: string | undefined): HeatmapDataService {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ?? null);
  const [stepSize] = useState<number>(50);

  const queryClient = useQueryClient();

  const isReady = !!token && projectId !== undefined && sessionId !== undefined;

  // プロジェクトデータを取得してis2Dフラグを取得
  const { data: project } = useQuery({
    queryKey: ['embed-project', projectId, token],
    queryFn: async () => {
      if (!projectId || !token) return null;
      const res = await embedFetch<ProjectResponse>(`/api/v0/projects/${projectId}`, token);
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isReady,
  });

  const zVisible = !(project?.is2D ?? false);

  const { data: createdTask } = useQuery({
    queryKey: ['embed-create-task', projectId, sessionId, stepSize, zVisible, token],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!projectId || !sessionId || !token) {
        return null;
      }

      const { data, error } = await sessionCreateTask(token, projectId, sessionId, stepSize, zVisible);
      if (error) throw new Error(error.message);
      return data ?? null;
    },
    enabled: isReady,
    retry: 3,
  });

  useEffect(() => {
    if (!createdTask) return;
    setTaskId(createdTask.taskId);
  }, [createdTask]);

  const { data: task } = useQuery({
    queryKey: ['embed-heatmap', taskId, token],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId)) || !token) return null;
      const { data, error } = await embedFetch<HeatmapTask>(`/api/v0/heatmap/tasks/${taskId}`, token);
      if (error) throw new Error(error.message);
      return data ?? null;
    },
    initialData: null,
    enabled: taskId !== null && !!token,
  });

  useEffect(() => {
    if (!task) return;

    if (task.status === 'pending' || task.status === 'processing') {
      timer.current = setInterval(async () => {
        await queryClient.invalidateQueries({ queryKey: ['embed-heatmap'] });
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
      if (!projectId || !token) {
        return [];
      }
      const { data, error } = await embedFetch<MapListResponse>(`/api/v0.1/projects/${projectId}/maps`, token);
      if (error) return [];
      return data?.maps || [];
    } catch {
      return [];
    }
  }, [projectId, token]);

  const getMapContent = useCallback(
    async (mapName: string) => {
      try {
        if (!mapName || mapName === '' || !token) return null;
        return await embedFetchArrayBuffer(`/api/v0/heatmap/map_data/${mapName}`, token);
      } catch {
        return null;
      }
    },
    [token],
  );

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (projectId === undefined || !token) return null;

      const queryParams = new URLSearchParams({
        project_id: String(projectId),
        ...(currentSessionId && { session_id: String(currentSessionId) }),
      });

      const { data, error } = await embedFetch<LogKeysResponse>(`/api/v0/general_log/position/keys?${queryParams}`, token);
      if (error) return null;
      return data?.keys ?? null;
    } catch {
      return null;
    }
  }, [projectId, currentSessionId, token]);

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!projectId || !currentSessionId || !token) return null;
      return await embedFetch<PositionEventLog[]>(
        `/api/v0/projects/${projectId}/play_session/${currentSessionId}/general_log/position/${logName}?limit=1000&offset=0`,
        token,
      );
    },
    [projectId, currentSessionId, token],
  );

  const eventLogKey = (projectId: number | undefined, sessionId: number | null, logName: string) =>
    ['embed-eventLog', projectId ?? 0, sessionId ?? 0, logName] as const;

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      const res = await getSessionLogs(logName);
      if (res?.error) throw new Error(res.error.message);
      const data = res?.data ?? null;
      if (data) {
        queryClient.setQueryData(eventLogKey(projectId, currentSessionId, logName), data);
      }
      return data;
    },
    [projectId, currentSessionId, getSessionLogs, queryClient],
  );

  const getEventLogSnapshot = useCallback(
    (logName: string): PositionEventLog[] | null => {
      return (queryClient.getQueryData(eventLogKey(projectId, currentSessionId, logName)) as PositionEventLog[] | undefined) ?? null;
    },
    [projectId, currentSessionId, queryClient],
  );

  return {
    isInitialized: isReady && projectId !== undefined,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    task: task || createdTask || undefined,
    getEventLog,
    getEventLogSnapshot,
    projectId,
    sessionId: currentSessionId,
    setSessionId: setCurrentSessionId,
  };
}

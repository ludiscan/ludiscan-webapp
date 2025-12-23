import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FieldObjectLog, HeatmapDataService, MapContentResult, Player, SessionSearchParams } from './HeatmapDataService';
import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { Project } from '@src/modeles/project';
import type { Session } from '@src/modeles/session';

import { createEmbedClient } from '@src/modeles/qeury';

/**
 * ファイル形式文字列をModelFileTypeに変換
 */
function parseModelFileType(fileTypeStr: string | null): ModelFileType | null {
  if (!fileTypeStr) return null;
  const lower = fileTypeStr.toLowerCase();
  if (lower === 'obj' || lower === 'fbx' || lower === 'gltf' || lower === 'glb') {
    return lower as ModelFileType;
  }
  return null;
}

/**
 * Embed用のHeatmapDataService
 * x-embed-tokenヘッダーを使用して認証し、通常のAPIクライアントを使用
 */

export function useEmbedHeatmapDataService(projectId: number | undefined, sessionId: number | undefined, token: string | undefined): HeatmapDataService {
  const timer = useRef<NodeJS.Timeout>(undefined);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(sessionId ?? null);
  const [stepSize] = useState<number>(50);

  const queryClient = useQueryClient();

  const isReady = !!token && projectId !== undefined && sessionId !== undefined;

  // Embed用のAPIクライアントを作成（tokenが変わったら再作成）
  const apiClient = useMemo(() => {
    if (!token) return null;
    return createEmbedClient(token);
  }, [token]);

  // プロジェクトデータを取得してis2Dフラグを取得
  const { data: project } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['embed-project', projectId, token],
    queryFn: async () => {
      if (!projectId || !apiClient) return null;
      const res = await apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: projectId } },
      });
      return res.data ?? null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isReady && !!apiClient,
  });

  const zVisible = !(project?.is2D ?? false);

  const { data: createdTask } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['embed-create-task', projectId, sessionId, stepSize, zVisible, token],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!projectId || !sessionId || !apiClient) {
        return null;
      }

      const { data, error } = await apiClient.POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
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
      if (error) throw error;
      return data ?? null;
    },
    enabled: isReady && !!apiClient,
    retry: 3,
  });

  useEffect(() => {
    if (!createdTask) return;
    setTaskId(createdTask.taskId);
  }, [createdTask]);

  const { data: task } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['embed-heatmap', taskId, token],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId)) || !apiClient) return null;
      const { data, error } = await apiClient.GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) throw error;
      return data ?? null;
    },
    initialData: null,
    enabled: taskId !== null && !!apiClient,
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
      if (!projectId || !apiClient) {
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
    async (mapName: string): Promise<MapContentResult | null> => {
      try {
        if (!mapName || mapName === '' || !apiClient) return null;
        const { data, error, response } = await apiClient.GET('/api/v0/heatmap/map_data/{map_name}', {
          params: {
            path: {
              map_name: mapName,
            },
          },
          parseAs: 'arrayBuffer',
        });
        if (error) return null;

        // レスポンスヘッダーからファイル形式を取得
        const fileTypeHeader = response.headers.get('X-Model-File-Type');
        const fileType = parseModelFileType(fileTypeHeader);

        return { data, fileType };
      } catch {
        return null;
      }
    },
    [apiClient],
  );

  const getGeneralLogKeys = useCallback(async () => {
    try {
      if (projectId === undefined || !apiClient) return null;

      const { data, error } = await apiClient.GET('/api/v0/general_log/position/keys', {
        params: {
          query: {
            project_id: projectId,
            session_id: currentSessionId ?? undefined,
          },
        },
      });
      if (error) return null;
      return data.keys;
    } catch {
      return null;
    }
  }, [projectId, currentSessionId, apiClient]);

  const getSessionLogs = useCallback(
    async (logName: string) => {
      if (!projectId || !currentSessionId || !apiClient) return null;
      return await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', {
        params: {
          path: {
            project_id: projectId,
            session_id: currentSessionId,
            event_type: logName,
          },
          query: {
            limit: 1000,
            offset: 0,
          },
        },
      });
    },
    [projectId, currentSessionId, apiClient],
  );

  const eventLogKey = (projectId: number | undefined, sessionId: number | null, logName: string) =>
    ['embed-eventLog', projectId ?? 0, sessionId ?? 0, logName] as const;

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      const res = await getSessionLogs(logName);
      if (res?.error) throw res.error;
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

  const getProject = useCallback(async (): Promise<Project | null> => {
    if (!projectId || !apiClient) return null;
    const res = await apiClient.GET('/api/v0/projects/{id}', {
      params: { path: { id: projectId } },
    });
    return res.data ?? null;
  }, [projectId, apiClient]);

  const getSession = useCallback(async (): Promise<Session | null> => {
    if (!projectId || !currentSessionId || !apiClient) return null;
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}', {
      params: { path: { project_id: projectId, session_id: currentSessionId } },
    });
    return res.data ?? null;
  }, [projectId, currentSessionId, apiClient]);

  const getSessions = useCallback(
    async (limit = 100, offset = 0): Promise<Session[]> => {
      if (!projectId || !apiClient) return [];
      const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session', {
        params: { path: { project_id: projectId }, query: { limit, offset } },
      });
      return (res.data as Session[]) ?? [];
    },
    [projectId, apiClient],
  );

  const searchSessions = useCallback(
    async (params: SessionSearchParams): Promise<Session[]> => {
      if (!projectId || !apiClient) return [];
      const res = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/search', {
        params: {
          path: { project_id: projectId },
          query: {
            q: params.q,
            device_id: params.deviceId,
            platform: params.platform,
            is_playing: params.isPlaying,
            limit: params.limit ?? 100,
            offset: params.offset ?? 0,
          },
        },
      });
      return res.data?.data ?? [];
    },
    [projectId, apiClient],
  );

  const getPlayers = useCallback(async (): Promise<Player[]> => {
    if (!projectId || !currentSessionId || !apiClient) return [];
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
      params: { path: { project_id: projectId, session_id: currentSessionId } },
    });
    return (res.data as unknown as Player[]) ?? [];
  }, [projectId, currentSessionId, apiClient]);

  const getFieldObjectLogs = useCallback(async (): Promise<FieldObjectLog[]> => {
    if (!projectId || !currentSessionId || !apiClient) return [];
    const res = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/field_object_log', {
      params: { path: { project_id: projectId, session_id: currentSessionId } },
    });
    return (res.data as unknown as FieldObjectLog[]) ?? [];
  }, [projectId, currentSessionId, apiClient]);

  const loadTask = useCallback(
    (newTaskId: number) => {
      setTaskId(newTaskId);
    },
    [setTaskId],
  );

  return {
    isInitialized: isReady && projectId !== undefined && !!apiClient,
    isEmbed: true,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    task: task || createdTask || undefined,
    getEventLog,
    getEventLogSnapshot,
    projectId,
    sessionId: currentSessionId,
    setSessionId: setCurrentSessionId,
    sessionHeatmapIds: undefined,
    setSessionHeatmapIds: () => {},
    loadTask,
    getProject,
    getSession,
    getSessions,
    searchSessions,
    getPlayers,
    getFieldObjectLogs,
  };
}

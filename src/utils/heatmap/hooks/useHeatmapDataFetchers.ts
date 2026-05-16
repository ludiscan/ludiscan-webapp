import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { FieldObjectLog, MapContentResult, Player, SessionSearchParams } from '../HeatmapDataService';
import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { createClient } from '@src/modeles/qeury';
import type { Session } from '@src/modeles/session';

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

export function useHeatmapDataFetchers(apiClient: ReturnType<typeof createClient>, projectId: number | undefined, sessionId: number | null) {
  const queryClient = useQueryClient();

  const getMapList = useCallback(
    async (activeOnly?: boolean) => {
      try {
        if (!projectId) {
          return [];
        }
        const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/maps', {
          params: {
            path: {
              project_id: Number(projectId),
            },
            query: {
              activeOnly,
            },
          },
        });
        if (error) return [];
        return data.maps || [];
      } catch {
        return [];
      }
    },
    [projectId, apiClient],
  );

  const getMapContent = useCallback(
    async (mapName: string): Promise<MapContentResult | null> => {
      try {
        if (!mapName || mapName === '') return null;
        const { data, error, response } = await apiClient.GET('/api/v0/heatmap/map_data/{map_name}', {
          params: {
            path: {
              map_name: mapName,
            },
          },
          parseAs: 'arrayBuffer',
        });
        if (error) return null;

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

  const eventLogKey = useCallback((pId: number | undefined, sId: number | null, logName: string) => ['eventLog', pId ?? 0, sId ?? 0, logName] as const, []);

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
    [projectId, sessionId, getSessionLogs, getProjectLogs, queryClient, eventLogKey],
  );

  const getEventLogSnapshot = useCallback(
    (logName: string): PositionEventLog[] | null => {
      return (queryClient.getQueryData(eventLogKey(projectId, sessionId, logName)) as PositionEventLog[] | undefined) ?? null;
    },
    [projectId, sessionId, queryClient, eventLogKey],
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

  const searchSessions = useCallback(
    async (params: SessionSearchParams) => {
      if (!projectId) return [];
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

  return {
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    getEventLog,
    getEventLogSnapshot,
    getProject,
    getSession,
    getSessions,
    searchSessions,
    getPlayers,
    getFieldObjectLogs,
  };
}

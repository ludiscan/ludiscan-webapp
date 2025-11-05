import { useCallback } from 'react';

import type { SessionSummary } from '@src/modeles/heatmaptask';

import { useApiClient } from '@src/modeles/ApiClientContext';

export function useSummaryApi() {
  const apiClient = useApiClient();

  const fetchLatestSummary = useCallback(
    async (projectId: number, sessionId: number): Promise<SessionSummary | null> => {
      try {
        const { data, error } = await apiClient.GET('/api/v0.1/projects/{project_id}/sessions/{session_id}/summary' as const, {
          params: { path: { project_id: projectId, session_id: sessionId } },
        });
        if (error) {
          if (error.code === 404) return null; // 404なら未生成
          throw error; // 他のエラーは上位に
        }
        if (!data) return null;
        return data; // ここは生成クライアントの型に合わせて
      } catch {
        return null; // ネットワークエラー等は未生成とみなす
      }
    },
    [apiClient],
  );

  const enqueueSummary = useCallback(
    async (params: {
      projectId: number;
      sessionId: number;
      lang?: 'ja' | 'en';
      stepSize?: number;
      zVisible?: boolean;
      provider?: 'template' | 'openai' | 'ollama';
    }) => {
      const { projectId, sessionId, lang = 'ja', stepSize = 50, zVisible = true, provider = 'openai' } = params;
      if (!projectId || !sessionId) throw new Error('projectId and sessionId are required');
      const { data } = await apiClient.POST('/api/v0.1/projects/{project_id}/sessions/{session_id}/summary' as const, {
        params: {
          path: { project_id: projectId, session_id: sessionId },
          query: { lang, step_size: stepSize, z_visible: zVisible, queue: true, provider },
        },
      });
      return data; // DTO（status:'queued'）が返る想定
    },
    [apiClient],
  );

  return {
    fetchLatestSummary,
    enqueueSummary,
  };
}

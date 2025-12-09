import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@src/modeles/ApiClientContext';

/**
 * イベントクラスタと改善案ルートを取得するHook
 *
 * @param projectId プロジェクトID
 * @param sessionId セッションID
 * @param playerId プレイヤーID（オプション - 指定されない場合は全プレイヤーのデータを取得）
 * @param options
 */
export function useImprovementRoutes(
  projectId: number,
  sessionId: number | null,
  playerId?: string,
  options?: {
    mapName?: string;
    eventType?: 'death' | 'success';
    freshnessDays?: number;
    enabled?: boolean;
  },
) {
  const client = useApiClient();
  const queryKey = ['improvementRoutes', sessionId, projectId, playerId, options?.mapName, options?.eventType, options?.freshnessDays];

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!sessionId) {
        return null;
      }
      const queryParams = {
        session_id: sessionId,
        ...(playerId && { player_id: playerId }),
        ...(options?.mapName && { map_name: options.mapName }),
        ...(options?.eventType && { event_type: options.eventType }),
        ...(options?.freshnessDays && {
          freshness_days: options.freshnessDays,
        }),
      };

      const response = await client.GET('/api/v0/route-coach/projects/{project_id}/event-clusters', {
        params: {
          path: { project_id: projectId },
          query: queryParams,
        },
      });

      if (response.error) {
        throw new Error(`Failed to fetch improvement routes: ${response.error.message || 'Unknown error'}`);
      }

      return response.data;
    },
    enabled: options?.enabled !== false && !!projectId,
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 30 * 60 * 1000, // 30分
  });
}

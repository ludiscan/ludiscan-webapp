import { useQuery } from '@tanstack/react-query';

import { createClient } from '@src/modeles/qeury';

/**
 * イベントクラスタと改善案ルートを取得するHook
 *
 * @param projectId プロジェクトID
 * @param playerId プレイヤーID（オプション - 指定されない場合は全プレイヤーのデータを取得）
 * @param options
 */
export function useImprovementRoutes(
  projectId: number,
  playerId?: string,
  options?: {
    mapName?: string;
    eventType?: 'death' | 'success';
    freshnessDays?: number;
    enabled?: boolean;
  },
) {
  const client = createClient();
  const queryKey = ['improvementRoutes', projectId, playerId, options?.mapName, options?.eventType, options?.freshnessDays];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const queryParams = {
        ...(playerId && { player_id: playerId }),
        ...(options?.mapName && { map_name: options.mapName }),
        ...(options?.eventType && { event_type: options.eventType }),
        ...(options?.freshnessDays && {
          freshness_days: options.freshnessDays,
        }),
      } as any;

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

/**
 * 改善案ルートの詳細情報を取得するHook
 */
export function useEventClusters(projectId: number, playerId: string, mapName?: string) {
  return useImprovementRoutes(projectId, playerId, { mapName });
}

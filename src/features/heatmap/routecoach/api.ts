import type { components } from '@generated/api';

import { createClient } from '@src/modeles/qeury';

/**
 * RouteCoach v2 API
 * イベントクラスタと改善案ルートを取得・管理
 */

export type EventClusterDetailDto = components['schemas']['EventClusterDetailDto'];
export type ImprovementRouteDto = components['schemas']['ImprovementRouteDto'];
export type SubmitImprovementRouteFeedbackRequestDto = components['schemas']['SubmitImprovementRouteFeedbackRequestDto'];
export type SubmitImprovementRouteFeedbackResponseDto = components['schemas']['SubmitImprovementRouteFeedbackResponseDto'];

/**
 * プロジェクトのイベントクラスタと改善案を取得
 * @param projectId プロジェクトID
 * @param playerId プレイヤーID
 * @param mapName マップ名（optional）
 * @param eventType イベントタイプ（optional: 'death' | 'success'）
 * @param freshnessDays データ鮮度（日数、デフォルト: 30）
 */
export async function fetchEventClusters(
  projectId: number,
  playerId: string,
  mapName?: string,
  eventType?: 'death' | 'success',
  freshnessDays?: number,
): Promise<EventClusterDetailDto[] | null> {
  try {
    const { data, error } = await createClient().GET('/api/v0/route-coach/projects/{project_id}/event-clusters', {
      params: {
        path: { project_id: projectId },
        query: {
          player_id: playerId,
          ...(mapName && { map_name: mapName }),
          ...(eventType && { event_type: eventType }),
          ...(freshnessDays !== undefined && { freshness_days: freshnessDays }),
        },
      },
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch event clusters:', error);
      return null;
    }
    return data || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch event clusters:', err);
    return null;
  }
}

/**
 * 改善案ルートへのフィードバックを送信
 * @param improvementRouteId 改善案ルートID
 * @param rating 評価（1: Bad, 2: Neutral, 3: Good）
 * @param comment コメント（optional）
 */
export async function submitImprovementRouteFeedback(
  improvementRouteId: number,
  rating: 1 | 2 | 3,
  comment?: string,
): Promise<SubmitImprovementRouteFeedbackResponseDto | null> {
  try {
    const { data, error } = await createClient().POST('/api/v0/route-coach/improvement-routes/{improvement_route_id}/feedback', {
      params: {
        path: { improvement_route_id: improvementRouteId },
      },
      body: {
        rating,
        ...(comment && { comment }),
      },
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to submit feedback:', error);
      throw error;
    }
    return data || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to submit feedback:', err);
    throw err;
  }
}

/**
 * プロジェクトの改善ルート生成ジョブを投入
 * @param projectId プロジェクトID
 * @param mapName マップ名（optional）
 * @param force 強制再生成フラグ（true の場合、既存の completed/failed タスクを削除して再生成）
 */
export async function generateImprovementRoutes(projectId: number, mapName?: string, force?: boolean) {
  try {
    const query: Record<string, string> = {};
    if (mapName) {
      query.map_name = mapName;
    }
    if (force) {
      query.force = 'true';
    }

    const { data, error } = await createClient().POST('/api/v0/route-coach/projects/{project_id}/generate-improvement-routes', {
      params: {
        path: { project_id: projectId },
        ...(Object.keys(query).length > 0 && { query }),
      },
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to generate improvement routes:', error);
      throw error;
    }
    return data || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate improvement routes:', err);
    throw err;
  }
}

/**
 * 改善ルート生成タスクの状態を取得
 * @param taskId タスクID
 */
export async function getImprovementRoutesTaskStatus(taskId: number) {
  try {
    const { data, error } = await createClient().GET('/api/v0/route-coach/improvement-routes-jobs/{job_id}', {
      params: {
        path: { job_id: taskId },
      },
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get task status:', error);
      return null;
    }
    return data || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to get task status:', err);
    return null;
  }
}

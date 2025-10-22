import type { components } from '@generated/api';

import { createClient } from '@src/modeles/qeury';

export type RouteEdgeDto = components['schemas']['RouteEdgeDto'];
export type RouteSuggestionDto = components['schemas']['RouteSuggestionDto'];
export type RouteHabitDto = components['schemas']['RouteHabitDto'];

/**
 * セッション内のルート分析タスクを開始
 */
export async function createRouteCoachTask(projectId: number, sessionId: number): Promise<{ taskId: number }> {
  if (!projectId || !sessionId) throw new Error('projectId and sessionId are required');

  const { data, error } = await createClient().POST('/api/v0/route-coach/projects/{project_id}/sessions/{session_id}/tasks', {
    params: {
      path: { project_id: projectId, session_id: sessionId },
    },
  });

  if (error) throw error;
  if (!data) throw new Error('Failed to create route coach task');
  return data as { taskId: number };
}

/**
 * セッションのルート統計を取得
 */
export async function fetchRouteCoachSummary(projectId: number, sessionId: number): Promise<RouteEdgeDto[] | null> {
  try {
    const { data, error } = await createClient().GET('/api/v0/route-coach/projects/{project_id}/sessions/{session_id}/summary', {
      params: {
        path: { project_id: projectId, session_id: sessionId },
      },
    });

    if (error) {
      if (error.code === 404) return null; // タスク未実行
      throw error;
    }
    if (!data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * セッション内のプレイヤーのルート改善提案を取得
 */
export async function fetchRouteCoachSuggestions(projectId: number, sessionId: number, playerId: number): Promise<RouteSuggestionDto[] | null> {
  try {
    const { data, error } = await createClient().GET('/api/v0/route-coach/projects/{project_id}/sessions/{session_id}/players/{player_id}/suggestions', {
      params: {
        path: { project_id: projectId, session_id: sessionId, player_id: playerId },
      },
    });

    if (error) {
      if (error.code === 404) return null;
      throw error;
    }
    if (!data) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * セッション内のプレイヤーのルート習慣（よく使うルート）を取得
 */
export async function fetchRouteCoachHabits(projectId: number, sessionId: number, playerId: number, topK: number = 5): Promise<RouteHabitDto[] | null> {
  try {
    const { data, error } = await createClient().GET('/api/v0/route-coach/projects/{project_id}/sessions/{session_id}/players/{player_id}/habits', {
      params: {
        path: { project_id: projectId, session_id: sessionId, player_id: playerId },
        query: { topK },
      },
    });

    if (error) {
      if (error.code === 404) return null;
      throw error;
    }
    if (!data) return null;
    return data;
  } catch {
    return null;
  }
}

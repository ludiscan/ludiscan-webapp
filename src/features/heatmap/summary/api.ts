import type { SessionSummary } from '@src/modeles/heatmaptask';

import { createClient } from '@src/modeles/qeury';

export async function fetchLatestSummary(projectId: number, sessionId: number): Promise<SessionSummary | null> {
  try {
    const { data, error } = await createClient().GET('/api/v0.1/projects/{project_id}/sessions/{session_id}/summary', {
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
}

export async function enqueueSummary(params: {
  projectId: number;
  sessionId: number;
  lang?: 'ja' | 'en';
  stepSize?: number;
  zVisible?: boolean;
  provider?: 'template' | 'openai' | 'ollama';
}) {
  const { projectId, sessionId, lang = 'ja', stepSize = 50, zVisible = true, provider = 'openai' } = params;
  if (!projectId || !sessionId) throw new Error('projectId and sessionId are required');
  const { data } = await createClient().POST('/api/v0.1/projects/{project_id}/sessions/{session_id}/summary', {
    params: {
      path: { project_id: projectId, session_id: sessionId },
      query: { lang, step_size: stepSize, z_visible: zVisible, queue: true, provider },
    },
  });
  return data; // DTO（status:'queued'）が返る想定
}

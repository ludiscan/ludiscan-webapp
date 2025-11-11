import createClientFetch from 'openapi-fetch';

import type { paths } from '@generated/api';
import type { ApiClient } from '@src/modeles/ApiClientContext';

import { MockApiRouter } from '@src/modeles/MockApiRouter';
import { loadMockJson, loadMockArrayBuffer, interpolatePath } from '@src/modeles/MockDataLoader';

/**
 * Mock APIクライアントを作成
 * パターンベースのルーターを使用してリクエストを処理
 */
export function createMockApiClient(mockDataDir: string = '/mocks/heatmap'): ApiClient {
  const baseUrl = '';
  const router = new MockApiRouter();

  // ==================== GET ハンドラーの登録 ====================

  // Heatmap Task 詳細
  router.registerGet('/api/v0/heatmap/tasks/{task_id}', async (params) => {
    const taskId = params.task_id;
    return await loadMockJson(`${mockDataDir}/task_${taskId}.json`);
  });

  // Project Maps
  router.registerGet('/api/v0.1/projects/{project_id}/maps', async (params) => {
    const projectId = params.project_id;
    return await loadMockJson(`${mockDataDir}/project_${projectId}_maps.json`);
  });

  // Heatmap Map Data (Binary or JSON)
  router.registerGet('/api/v0/heatmap/map_data/{map_name}', async (params, query, _body, parseAs) => {
    const mapName = params.map_name;

    if (parseAs === 'arrayBuffer') {
      const filePath = `${mockDataDir}/maps/${mapName}.obj`;
      const buffer = await loadMockArrayBuffer(filePath);
      // if (buffer) {
      //   console.log(`[Mock] Successfully loaded ArrayBuffer (size: ${buffer.byteLength} bytes)`);
      // } else {
      //   console.warn(`[Mock] Failed to load ArrayBuffer from: ${filePath}`);
      // }
      return buffer;
    }

    const filePath = `${mockDataDir}/maps/${mapName}.json`;
    return await loadMockJson(filePath);
  });

  // General Log Position Keys
  router.registerGet('/api/v0/general_log/position/keys', async (_params, query) => {
    const projectId = query?.project_id;
    const sessionId = query?.session_id;
    const key = sessionId ? `project_${projectId}_session_${sessionId}_keys.json` : `project_${projectId}_keys.json`;
    return await loadMockJson(`${mockDataDir}/${key}`);
  });

  // Project General Log Position by Event Type
  router.registerGet('/api/v0/projects/{id}/general_log/position/{event_type}', async (params) => {
    const projectId = params.id;
    const eventType = params.event_type;
    return await loadMockJson(`${mockDataDir}/project_${projectId}_event_${eventType}.json`);
  });

  // Session General Log Position by Event Type
  router.registerGet('/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}', async (params) => {
    const path = interpolatePath(`${mockDataDir}/project_{project_id}_session_{session_id}_event_{event_type}.json`, params);
    return await loadMockJson(path);
  });

  // Project Details
  router.registerGet('/api/v0/projects/{id}', async (params) => {
    const projectId = params.id;
    return await loadMockJson(`${mockDataDir}/project_${projectId}.json`);
  });

  // Session Field Object Log
  router.registerGet('/api/v0/projects/{project_id}/play_session/{session_id}/field_object_log', async (params) => {
    const path = interpolatePath(`${mockDataDir}/project_{project_id}_session_{session_id}_field_object_log.json`, params);
    return await loadMockJson(path);
  });

  // ==================== POST ハンドラーの登録 ====================

  // Create Heatmap Task (Project-level)
  router.registerPost('/api/v0/heatmap/projects/{project_id}/tasks', async (params) => {
    const projectId = params.project_id;
    return await loadMockJson(`${mockDataDir}/create_task_project_${projectId}.json`);
  });

  // Create Heatmap Task (Session-level)
  router.registerPost('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', async (params) => {
    const path = interpolatePath(`${mockDataDir}/create_task_project_{project_id}_session_{session_id}.json`, params);
    return await loadMockJson(path);
  });

  // openapi-fetchのクライアントを作成
  const client = createClientFetch<paths>({
    baseUrl,
  });

  // GETメソッドをオーバーライド
  const handleGet = async (path: string, init?: Record<string, unknown>): Promise<{ data?: unknown; error?: { message: string }; response: Response }> => {
    try {
      const params = init?.params as Record<string, unknown> | undefined;
      const pathParams = params?.path as Record<string, unknown> | undefined;
      const query = params?.query as Record<string, unknown> | undefined;
      const parseAs = init?.parseAs as string | undefined;

      // パステンプレートを実際のパス パラメータ値で補間
      let interpolatedPath = path;
      if (pathParams && Object.keys(pathParams).length > 0) {
        interpolatedPath = path.replace(/{([^}]+)}/g, (match, key) => {
          const value = pathParams[key];
          return value !== undefined ? String(value) : match;
        });
      }

      const data = await router.handleGet(interpolatedPath, query, parseAs);
      return {
        data,
        error: undefined,
        response: new Response(),
      };
    } catch (error) {
      return {
        data: undefined,
        error: { message: String(error) },
        response: new Response(),
      };
    }
  };

  client.GET = handleGet as ReturnType<typeof createClientFetch<paths>>['GET'];

  // POSTメソッドをオーバーライド
  const handlePost = async (path: string, init?: Record<string, unknown>): Promise<{ data?: unknown; error?: { message: string }; response: Response }> => {
    try {
      const params = init?.params as Record<string, unknown> | undefined;
      const pathParams = params?.path as Record<string, unknown> | undefined;
      const query = params?.query as Record<string, unknown> | undefined;
      const body = init?.body;

      // パステンプレートを実際のパス パラメータ値で補間
      let interpolatedPath = path;
      if (pathParams && Object.keys(pathParams).length > 0) {
        interpolatedPath = path.replace(/{([^}]+)}/g, (match, key) => {
          const value = pathParams[key];
          return value !== undefined ? String(value) : match;
        });
      }

      const data = await router.handlePost(interpolatedPath, body, query);
      return {
        data,
        error: undefined,
        response: new Response(),
      };
    } catch (error) {
      return {
        data: undefined,
        error: { message: String(error) },
        response: new Response(),
      };
    }
  };

  client.POST = handlePost as ReturnType<typeof createClientFetch<paths>>['POST'];

  return client as ApiClient;
}

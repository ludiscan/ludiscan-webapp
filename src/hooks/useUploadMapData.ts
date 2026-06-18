import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ModelTransform } from '@src/utils/heatmap/modelTransform';

import { env } from '@src/config/env';
import { createClient } from '@src/modeles/qeury';
import { toModelTransform } from '@src/utils/heatmap/modelTransform';

interface UploadMapDataParams {
  projectId: number;
  mapName: string;
  file: File;
  // モデルの配置情報（位置・回転・スケール）。指定時はファイルと一緒に保存される。
  transform?: ModelTransform | null;
}

interface UpdateMapTransformParams {
  projectId: number;
  mapName: string;
  transform: ModelTransform;
}

interface ImportMapParams {
  // 取り込み先プロジェクト（管理権限が必要）
  projectId: number;
  mapName: string;
  // 取り込み元プロジェクト（閲覧権限が必要）
  sourceProjectId: number;
}

/**
 * マップデータ（OBJファイルなど）をアップロードするHook
 * Note: openapi-fetchはmultipart/form-dataを正しく処理しないため、直接fetchを使用
 */
export function useUploadMapData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, mapName, file, transform }: UploadMapDataParams) => {
      const formData = new FormData();
      formData.append('file', file, file.name);
      if (transform) {
        formData.append('transform', JSON.stringify(transform));
      }

      const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
      const url = `${baseUrl}/api/v0/heatmap/projects/${projectId}/map_data/${encodeURIComponent(mapName)}`;

      // Content-Typeは設定しない（ブラウザが自動でmultipart/form-data; boundary=...を設定）
      // credentials: 'include'でcookie認証を維持
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to upload map data: ${errorData.message || response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate map data queries to refresh available maps
      queryClient.invalidateQueries({
        queryKey: ['mapData'],
      });
    },
  });
}

/**
 * マップモデルの配置情報（transform）を取得するHook。
 * バイナリ（map_data）とは別のキャッシュされないエンドポイントから常に最新を取得する。
 */
export function useMapTransform(projectId: number | undefined, mapName: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['mapTransform', projectId, mapName],
    queryFn: async (): Promise<ModelTransform | null> => {
      if (!mapName || projectId === undefined) return null;
      const { data, error } = await createClient().GET('/api/v0/heatmap/projects/{project_id}/map_data/{map_name}/transform', {
        params: { path: { project_id: projectId, map_name: mapName } },
      });
      if (error) return null;
      // サーバー側で検証済みだが、tuple 型へ正規化して返す
      return toModelTransform(data?.transform ?? null);
    },
    enabled: enabled && !!mapName && projectId !== undefined,
    staleTime: 0,
  });
}

/**
 * アップロード済みマップの配置情報（transform）のみを更新するHook。
 * ファイルの再アップロードは不要。
 */
export function useUpdateMapTransform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, mapName, transform }: UpdateMapTransformParams) => {
      const { error } = await createClient().PATCH('/api/v0/heatmap/projects/{project_id}/map_data/{map_name}/transform', {
        params: { path: { project_id: projectId, map_name: mapName } },
        body: transform,
      });
      if (error) {
        throw new Error(`Failed to update transform: ${error.message ?? 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mapData'],
      });
      queryClient.invalidateQueries({
        queryKey: ['mapTransform'],
      });
    },
  });
}

/**
 * 別プロジェクトのモデルを現在のプロジェクトに取り込むHook（コピー）。
 * 取り込み先で管理権限、取り込み元で閲覧権限が必要。
 */
export function useImportMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, mapName, sourceProjectId }: ImportMapParams) => {
      const { error } = await createClient().POST('/api/v0/heatmap/projects/{project_id}/map_data/{map_name}/import', {
        params: { path: { project_id: projectId, map_name: mapName } },
        body: { sourceProjectId },
      });
      if (error) {
        throw new Error(`Failed to import model: ${error.message ?? 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mapData'],
      });
      queryClient.invalidateQueries({
        queryKey: ['mapTransform'],
      });
    },
  });
}

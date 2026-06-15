import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ModelTransform } from '@src/utils/heatmap/modelTransform';

import { env } from '@src/config/env';
import { parseTransformHeader } from '@src/utils/heatmap/modelTransform';

interface UploadMapDataParams {
  mapName: string;
  file: File;
  // モデルの配置情報（位置・回転・スケール）。指定時はファイルと一緒に保存される。
  transform?: ModelTransform | null;
}

interface UpdateMapTransformParams {
  mapName: string;
  transform: ModelTransform;
}

/**
 * マップデータ（OBJファイルなど）をアップロードするHook
 * Note: openapi-fetchはmultipart/form-dataを正しく処理しないため、直接fetchを使用
 */
export function useUploadMapData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mapName, file, transform }: UploadMapDataParams) => {
      const formData = new FormData();
      formData.append('file', file, file.name);
      if (transform) {
        formData.append('transform', JSON.stringify(transform));
      }

      const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
      const url = `${baseUrl}/api/v0/heatmap/map_data/${encodeURIComponent(mapName)}`;

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
export function useMapTransform(mapName: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['mapTransform', mapName],
    queryFn: async (): Promise<ModelTransform | null> => {
      if (!mapName) return null;
      const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
      const url = `${baseUrl}/api/v0/heatmap/map_data/${encodeURIComponent(mapName)}/transform`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        cache: 'no-store',
      });
      if (!response.ok) return null;
      const data = (await response.json().catch(() => null)) as { transform?: unknown } | null;
      // 保存済みの値を共通バリデーションで検証して返す
      return parseTransformHeader(data?.transform != null ? JSON.stringify(data.transform) : null);
    },
    enabled: enabled && !!mapName,
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
    mutationFn: async ({ mapName, transform }: UpdateMapTransformParams) => {
      const baseUrl = env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
      const url = `${baseUrl}/api/v0/heatmap/map_data/${encodeURIComponent(mapName)}/transform`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transform),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update transform: ${errorData.message || response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mapData'],
      });
    },
  });
}

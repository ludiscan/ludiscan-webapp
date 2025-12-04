import { useMutation, useQueryClient } from '@tanstack/react-query';

import { env } from '@src/config/env';

interface UploadMapDataParams {
  mapName: string;
  file: File;
}

/**
 * マップデータ（OBJファイルなど）をアップロードするHook
 * Note: openapi-fetchはmultipart/form-dataを正しく処理しないため、直接fetchを使用
 */
export function useUploadMapData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mapName, file }: UploadMapDataParams) => {
      const formData = new FormData();
      formData.append('file', file, file.name);

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

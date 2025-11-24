import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createClient } from '@src/modeles/qeury';

interface UploadMapDataParams {
  mapName: string;
  file: File;
}

/**
 * マップデータ（OBJファイルなど）をアップロードするHook
 */
export function useUploadMapData() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mapName, file }: UploadMapDataParams) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await client.POST('/api/v0/heatmap/map_data/{map_name}', {
        params: {
          path: { map_name: mapName },
        },
        body: formData as unknown as { file?: string },
        bodySerializer: () => formData,
      });

      if (response.error) {
        throw new Error(`Failed to upload map data: ${response.error.message || 'Unknown error'}`);
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate map data queries to refresh available maps
      queryClient.invalidateQueries({
        queryKey: ['mapData'],
      });
    },
  });
}

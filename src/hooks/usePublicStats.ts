import { useQuery } from '@tanstack/react-query';

import type { components } from '@generated/api';

import { createClient } from '@src/modeles/qeury';

type PublicStatsResponse = components['schemas']['PublicStatsResponseDto'];

/**
 * 公開統計情報を取得するフック
 * 認証不要のパブリックエンドポイント
 */
export const usePublicStats = () => {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: async (): Promise<PublicStatsResponse> => {
      const client = createClient();
      const { data, error } = await client.GET('/api/v0/public-stats');

      if (error || !data) {
        throw new Error('Failed to fetch public stats');
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchOnWindowFocus: false,
  });
};

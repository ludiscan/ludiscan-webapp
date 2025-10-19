import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { GameApiKey, CreateGameApiKeyResponse } from '@src/types/api-keys';

import { createClient, DefaultStaleTime } from '@src/modeles/qeury';

export const useGameApiKeys = (queryKeyPrefix: (string | number)[] = ['api-keys']) => {
  const queryClient = useQueryClient();

  // API-keys一覧を取得
  const {
    data: allApiKeys = [],
    isLoading: isLoadingKeys,
    isError: isErrorKeys,
  } = useQuery({
    queryKey: queryKeyPrefix,
    queryFn: async () => {
      const { data, error } = await createClient().GET('/api/v0/game-api-keys', {
        params: {
          query: {
            limit: 100,
            offset: 0,
          },
        },
      });
      if (error) throw new Error('API-key一覧の取得に失敗しました');
      return (data || []) as GameApiKey[];
    },
    staleTime: DefaultStaleTime,
  });

  // ユーザーが所有するプロジェクト一覧を取得
  const { data: userProjects = [] } = useQuery({
    queryKey: ['user-projects'],
    queryFn: async () => {
      const { data, error } = await createClient().GET('/api/v0.1/projects', {
        params: {
          query: {
            limit: 100,
            offset: 0,
          },
        },
      });
      if (error) throw new Error('プロジェクト一覧の取得に失敗しました');
      return (data || []) as { id: number; name: string }[];
    },
    staleTime: DefaultStaleTime,
  });

  const handleCreateKey = useCallback(
    async (name: string) => {
      const { data, error } = await createClient().POST('/api/v0/game-api-keys', {
        body: { name },
      });

      if (error || !data) {
        throw new Error('API-keyの作成に失敗しました');
      }

      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      return data as CreateGameApiKeyResponse;
    },
    [queryClient, queryKeyPrefix],
  );

  const handleDeleteKey = useCallback(
    async (keyId: string) => {
      const { error } = await createClient().DELETE('/api/v0/game-api-keys/{id}', {
        params: {
          path: { id: keyId },
        },
      });

      if (error) {
        throw new Error('API-keyの削除に失敗しました');
      }

      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
    },
    [queryClient, queryKeyPrefix],
  );

  const handleUpdateKeyProjects = useCallback(
    async (keyId: string, projectIds: number[]) => {
      const { data, error } = await createClient().PUT('/api/v0/game-api-keys/{id}/projects', {
        params: {
          path: { id: keyId },
        },
        body: { projectIds },
      });

      if (error || !data) {
        throw new Error('プロジェクトの更新に失敗しました');
      }

      await queryClient.invalidateQueries({ queryKey: queryKeyPrefix });
      return data as GameApiKey;
    },
    [queryClient, queryKeyPrefix],
  );

  return {
    allApiKeys,
    isLoadingKeys,
    isErrorKeys,
    userProjects,
    handleCreateKey,
    handleDeleteKey,
    handleUpdateKeyProjects,
  };
};

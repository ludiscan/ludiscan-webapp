import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { paths } from '@generated/api';
import type { MaybeOptionalInit, FetchResponse } from 'openapi-fetch';
import type { PathsWithMethod, RequiredKeysOf } from 'openapi-typescript-helpers';

import { createClient } from '@src/modeles/qeury';

type InitParam<Init> = RequiredKeysOf<Init> extends never ? [(Init & { [key: string]: unknown })?] : [Init & { [key: string]: unknown }];

/**
 * useGetApi
 *
 * @param path OpenAPI 定義のパスキー (例: '/api/v0/general_log/position/{event_type}/{id}')
 * @param options キャッシュ設定 (staleTime, cacheTime) のオプション
 */
export function useGetApi<TPath extends PathsWithMethod<paths, 'get'>>(
  path: TPath,
  options?: {
    staleTime?: number;
    cacheTime?: number;
  },
) {
  const queryClient = useQueryClient();

  /**
   * fetch
   *
   * @param init GET リクエストのオプション (path params / query params)
   * @returns FetchResponse<paths[TPath]['get'], Init>
   */
  const fetch = useCallback(
    (
      init: InitParam<MaybeOptionalInit<paths[TPath], 'get'>>,
    ): Promise<FetchResponse<paths[TPath]['get'], InitParam<MaybeOptionalInit<paths[TPath], 'get'>>, 'application/json'>> | null => {
      return queryClient.fetchQuery({
        queryKey: [path, init],
        queryFn: async () => await createClient().GET(path, ...init),
        staleTime: options?.staleTime ?? 1000 * 60 * 5, // デフォルトは5分
      });
    },
    [queryClient, path, options?.staleTime],
  );

  return { fetch };
}

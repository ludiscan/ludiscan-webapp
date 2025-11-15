import { useQuery } from '@tanstack/react-query';

import type { paths } from '@generated/api';

import { createClient } from '@src/modeles/qeury';

type HealthCheckResponse = paths['/health']['get']['responses']['200']['content']['application/json'];

/**
 * useHealthCheck - Health check API hook
 *
 * @param options.refetchInterval - Refetch interval in milliseconds (default: 30000ms)
 * @param options.enabled - Enable or disable the query (default: true)
 */
export function useHealthCheck(options?: { refetchInterval?: number; enabled?: boolean }) {
  const { refetchInterval = 30000, enabled = true } = options || {};

  const query = useQuery({
    queryKey: ['health-check'],
    queryFn: async () => {
      const client = createClient();
      const response = await client.GET('/health');

      if (response.error) {
        throw new Error('Health check failed');
      }

      return response.data as HealthCheckResponse;
    },
    refetchInterval,
    enabled,
    staleTime: 10000, // 10秒
    retry: 3,
  });

  return query;
}

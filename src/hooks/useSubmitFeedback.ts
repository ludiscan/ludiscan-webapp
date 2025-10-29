import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createClient } from '@src/modeles/qeury';

interface SubmitFeedbackParams {
  improvementRouteId: number;
  playerId: string;
  rating: 1 | 2 | 3;
  comment?: string;
}

/**
 * 改善案ルートへのフィードバックを送信するHook
 */
export function useSubmitFeedback() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ improvementRouteId, playerId: _playerId, rating, comment }: SubmitFeedbackParams) => {
      const response = await client.POST('/api/v0/route-coach/improvement-routes/{improvement_route_id}/feedback', {
        params: {
          path: { improvement_route_id: improvementRouteId },
        },
        body: {
          rating,
          ...(comment && { comment }),
        },
      });

      if (response.error) {
        throw new Error(`Failed to submit feedback: ${response.error.message || 'Unknown error'}`);
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate improvement routes queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['improvementRoutes'],
      });
    },
  });
}

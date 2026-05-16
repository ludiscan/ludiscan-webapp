import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { useRouteCoachApi } from '@src/features/heatmap/routecoach/api';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export function useRouteCoachAction(service: HeatmapDataService) {
  const qc = useQueryClient();
  const routeCoachApi = useRouteCoachApi();

  // RouteCoach改善ルート生成
  const { mutate: startRouteCoach, isPending: isRouteCoachPending } = useMutation({
    mutationFn: async () => {
      if (!service.projectId || !service.sessionId) throw new Error('Project is required');
      return routeCoachApi.generateImprovementRoutes(service.projectId, service.sessionId);
    },
    onSuccess: async () => {
      // 生成後、RouteCoachメニューのキャッシュを無効化
      // RouteCoachMenuContentと同じquery keyを使用
      await qc.invalidateQueries({ queryKey: ['improvementRoutesTask', service.projectId, service.sessionId] });
      await qc.invalidateQueries({
        queryKey: ['improvementRoutes', service.projectId, service.sessionId],
        exact: false,
      });
      // メニューを自動開く
      heatMapEventBus.emit('click-menu-icon', { name: 'routecoach' });
    },
  });

  return { startRouteCoach, isRouteCoachPending };
}

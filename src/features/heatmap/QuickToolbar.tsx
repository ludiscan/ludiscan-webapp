import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useMemo } from 'react';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { QuickToolbarMenu, MenuIcons } from '@src/features/heatmap/QuickToolbarMenu';
import { SessionPicker } from '@src/features/heatmap/SessionPicker';
import { useRouteCoachApi } from '@src/features/heatmap/routecoach/api';
import { useGeneralPatch } from '@src/hooks/useGeneral';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type Props = {
  className?: string;
  service: HeatmapDataService;
  dimensionality: '2d' | '3d'; // 現在の次元（計算済み）
};

function Toolbar({ className, service, dimensionality }: Props) {
  const qc = useQueryClient();
  const routeCoachApi = useRouteCoachApi();

  // 2D/3Dモード切り替え用
  const patchGeneral = useGeneralPatch();

  const { data: sessions } = useQuery({
    queryKey: ['sessions', service.projectId],
    queryFn: () => service.getSessions(200, 0),
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined,
    refetchOnWindowFocus: false,
  });

  const sessionIds = useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];
    return sessions?.map((session) => String(session.sessionId)) || [];
  }, [sessions]);

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

  // 2D/3Dモード切り替えハンドラー（シンプルなトグル）
  const toggleDimensionality = useCallback(() => {
    const newMode = dimensionality === '2d' ? '3d' : '2d';
    patchGeneral((prev) => ({
      ...prev,
      dimensionalityOverride: newMode,
    }));
    // モード切り替え時はカメラをリセット
    if (newMode === '2d') {
      heatMapEventBus.emit('camera:reset-2d');
    } else {
      heatMapEventBus.emit('camera:reset-3d');
    }
  }, [dimensionality, patchGeneral]);

  const fit = useCallback(() => heatMapEventBus.emit('camera:fit'), []);
  const oneToOne = useCallback(() => heatMapEventBus.emit('camera:set-zoom-percent', { percent: 100 }), []);

  // セッション選択ハンドラー
  const handleSelectSession = useCallback(
    (sessionId: number) => {
      service.setSessionId(sessionId);
    },
    [service],
  );

  // Build menu sections (セッション選択はSessionPickerに移動)
  const menuSections = useMemo(() => {
    const viewActions = {
      id: 'view-actions',
      items: [
        {
          id: 'fit-view',
          label: 'Fit to View',
          icon: <MenuIcons.FitView />,
          shortcut: '0',
          onClick: fit,
        },
        {
          id: 'one-to-one',
          label: '1:1 Scale',
          icon: <MenuIcons.OneToOne />,
          onClick: oneToOne,
        },
        {
          id: 'toggle-dimension',
          label: dimensionality === '2d' ? 'Switch to 3D' : 'Switch to 2D',
          icon: dimensionality === '2d' ? <MenuIcons.View3D /> : <MenuIcons.View2D />,
          onClick: toggleDimensionality,
        },
        {
          id: 'route-coach',
          label: isRouteCoachPending ? 'Generating...' : 'Route Coach',
          icon: <MenuIcons.RouteCoach />,
          onClick: () => startRouteCoach(),
          disabled: !service.projectId,
          loading: isRouteCoachPending,
        },
      ],
    };

    return [viewActions];
  }, [fit, oneToOne, dimensionality, toggleDimensionality, isRouteCoachPending, service.projectId, startRouteCoach]);

  return (
    <div className={className} role='toolbar' aria-label='Viewer quick tools'>
      <SessionPicker sessionIds={sessionIds} currentSessionId={service.sessionId} onSelectSession={handleSelectSession} isLoading={!sessions} />
      <QuickToolbarMenu sections={menuSections} />
    </div>
  );
}

export const QuickToolbar = memo(
  styled(Toolbar)`
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    width: max-content;
    min-width: 100%;
    padding: 6px 32px;
    background: ${({ theme }) => theme.colors.surface.base};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  `,
  (prev, next) => {
    return (
      prev.className === next.className &&
      prev.service.projectId === next.service.projectId &&
      prev.service.sessionId === next.service.sessionId &&
      prev.dimensionality === next.dimensionality
    );
  },
);

QuickToolbar.displayName = 'QuickToolbar';

import styled from '@emotion/styled';
import { memo, useCallback, useMemo } from 'react';

import type { SessionFilters } from '@src/features/heatmap/SessionPickerModal';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { QuickToolbarMenu, MenuIcons } from '@src/features/heatmap/QuickToolbarMenu';
import { SessionPicker } from '@src/features/heatmap/SessionPicker';
import { SessionPickerModal } from '@src/features/heatmap/SessionPickerModal';
import { useRouteCoachAction } from '@src/features/heatmap/hooks/useRouteCoachAction';
import { useSessionModal } from '@src/features/heatmap/hooks/useSessionModal';
import { useSessionsList } from '@src/features/heatmap/hooks/useSessionsList';
import { useAppDispatch, useAppSelector } from '@src/hooks/useDispatch';
import { useGeneralPatch } from '@src/hooks/useGeneral';
import { setClickToFocusEnabled } from '@src/slices/selectionSlice';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type Props = {
  className?: string;
  service: HeatmapDataService;
  dimensionality: '2d' | '3d'; // 現在の次元（計算済み）
};

function Toolbar({ className, service, dimensionality }: Props) {
  const dispatch = useAppDispatch();
  const { isSessionModalOpen, handleOpenModal, handleCloseModal } = useSessionModal();
  const { startRouteCoach, isRouteCoachPending } = useRouteCoachAction(service);
  const { filters, setFilters, initialDeviceId, sessions, currentSession, isSessionsLoading, hasNextPage, isFetchingNextPage, handleLoadMore } =
    useSessionsList(service);

  // 2D/3Dモード切り替え用
  const patchGeneral = useGeneralPatch();

  // クリックフォーカス機能の状態
  const clickToFocusEnabled = useAppSelector((s) => s.selection.clickToFocusEnabled);

  // FPS統計表示の状態
  const showStats = useAppSelector((s) => s.heatmapCanvas.general.showStats);

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

  // クリックフォーカス機能トグルハンドラー
  const toggleClickFocus = useCallback(() => {
    dispatch(setClickToFocusEnabled(!clickToFocusEnabled));
  }, [dispatch, clickToFocusEnabled]);

  // FPS統計表示トグルハンドラー
  const toggleStats = useCallback(() => {
    patchGeneral((prev) => ({
      ...prev,
      showStats: !prev.showStats,
    }));
  }, [patchGeneral]);

  const fit = useCallback(() => heatMapEventBus.emit('camera:fit'), []);
  const oneToOne = useCallback(() => heatMapEventBus.emit('camera:set-zoom-percent', { percent: 100 }), []);

  // セッション選択ハンドラー
  const handleSelectSession = useCallback(
    (sessionId: number) => {
      service.setSessionId(sessionId);
    },
    [service],
  );

  // フィルタ変更ハンドラー
  const handleFiltersChange = useCallback(
    (newFilters: SessionFilters) => {
      setFilters(newFilters);
    },
    [setFilters],
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
          id: 'toggle-click-focus',
          label: clickToFocusEnabled ? 'Disable Click Focus' : 'Enable Click Focus',
          icon: <MenuIcons.ClickFocus />,
          onClick: toggleClickFocus,
          active: clickToFocusEnabled,
        },
        {
          id: 'route-coach',
          label: isRouteCoachPending ? 'Generating...' : 'Route Coach',
          icon: <MenuIcons.RouteCoach />,
          onClick: () => startRouteCoach(),
          disabled: !service.projectId,
          loading: isRouteCoachPending,
        },
        {
          id: 'toggle-stats',
          label: showStats ? 'Hide FPS Stats' : 'Show FPS Stats',
          icon: <MenuIcons.Stats />,
          onClick: toggleStats,
          active: showStats,
        },
      ],
    };

    return [viewActions];
  }, [
    fit,
    oneToOne,
    dimensionality,
    toggleDimensionality,
    clickToFocusEnabled,
    toggleClickFocus,
    isRouteCoachPending,
    service.projectId,
    startRouteCoach,
    showStats,
    toggleStats,
  ]);

  return (
    <div className={className} role='toolbar' aria-label='Viewer quick tools'>
      <SessionPicker currentSession={currentSession} onOpenModal={handleOpenModal} isLoading={isSessionsLoading} />
      <SessionPickerModal
        isOpen={isSessionModalOpen}
        onClose={handleCloseModal}
        sessions={sessions}
        currentSessionId={service.sessionId}
        onSelectSession={handleSelectSession}
        onLoadMore={handleLoadMore}
        isFetchingMore={isFetchingNextPage}
        hasMore={hasNextPage ?? false}
        isLoading={isSessionsLoading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        initialDeviceId={initialDeviceId}
      />
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
    justify-content: end;
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

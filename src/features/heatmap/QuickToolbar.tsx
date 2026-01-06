import styled from '@emotion/styled';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';

import type { SessionFilters } from '@src/features/heatmap/SessionPickerModal';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { QuickToolbarMenu, MenuIcons } from '@src/features/heatmap/QuickToolbarMenu';
import { SessionPicker } from '@src/features/heatmap/SessionPicker';
import { SessionPickerModal } from '@src/features/heatmap/SessionPickerModal';
import { useRouteCoachApi } from '@src/features/heatmap/routecoach/api';
import { useAppDispatch, useAppSelector } from '@src/hooks/useDispatch';
import { useGeneralPatch } from '@src/hooks/useGeneral';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { setClickToFocusEnabled } from '@src/slices/selectionSlice';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

const PAGE_SIZE = 50;

type Props = {
  className?: string;
  service: HeatmapDataService;
  dimensionality: '2d' | '3d'; // 現在の次元（計算済み）
};

function Toolbar({ className, service, dimensionality }: Props) {
  const qc = useQueryClient();
  const routeCoachApi = useRouteCoachApi();
  const dispatch = useAppDispatch();

  // セッション選択モーダルの状態
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  // フィルタ状態
  const [filters, setFilters] = useState<SessionFilters>({
    searchQuery: '',
    deviceId: null,
    deviceIdEnabled: true, // embedモードでは初期でオン
  });

  // embed用の初期deviceId（現在のセッションのdeviceId）
  const [initialDeviceId, setInitialDeviceId] = useState<string | null>(null);

  // 2D/3Dモード切り替え用
  const patchGeneral = useGeneralPatch();

  // クリックフォーカス機能の状態
  const clickToFocusEnabled = useAppSelector((s) => s.selection.clickToFocusEnabled);

  // FPS統計表示の状態
  const showStats = useAppSelector((s) => s.heatmapCanvas.general.showStats);

  // embedモードの場合、現在のセッションのdeviceIdを取得してフィルタに設定
  const { data: currentSessionData } = useQuery({
    queryKey: ['currentSession', service.projectId, service.sessionId],
    queryFn: () => service.getSession(),
    enabled: service.isEmbed && service.sessionId !== null,
    staleTime: DefaultStaleTime,
  });

  // embedモードで初回マウント時にdeviceIdを設定
  useEffect(() => {
    if (service.isEmbed && currentSessionData?.deviceId && initialDeviceId === null) {
      setInitialDeviceId(currentSessionData.deviceId);
      setFilters((prev) => ({
        ...prev,
        deviceId: currentSessionData.deviceId,
      }));
    }
  }, [service.isEmbed, currentSessionData?.deviceId, initialDeviceId]);

  // 検索クエリのデバウンス処理
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  // deviceIdフィルタは deviceIdEnabled がtrueの場合のみ適用
  const activeDeviceId = filters.deviceIdEnabled ? filters.deviceId : null;
  const hasActiveFilters = debouncedQuery.trim() !== '' || activeDeviceId !== null;

  // セッション検索API（フィルタが有効な場合）- ページネーション対応
  const {
    data: searchedSessionsData,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
    isLoading: isSearchLoading,
  } = useInfiniteQuery({
    queryKey: ['sessionsSearch', service.projectId, debouncedQuery, activeDeviceId],
    queryFn: async ({ pageParam = 0 }) => {
      const sessions = await service.searchSessions({
        q: debouncedQuery.trim() || undefined,
        deviceId: activeDeviceId ?? undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      });
      return {
        sessions,
        nextOffset: sessions.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined && hasActiveFilters,
    refetchOnWindowFocus: false,
  });

  // 通常のセッション一覧取得（フィルタが無効な場合）- ページネーション対応
  const {
    data: allSessionsData,
    fetchNextPage: fetchNextAllPage,
    hasNextPage: hasNextAllPage,
    isFetchingNextPage: isFetchingNextAllPage,
    isLoading: isAllSessionsLoading,
  } = useInfiniteQuery({
    queryKey: ['sessions', service.projectId],
    queryFn: async ({ pageParam = 0 }) => {
      const sessions = await service.getSessions(PAGE_SIZE, pageParam);
      return {
        sessions,
        nextOffset: sessions.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: DefaultStaleTime,
    enabled: service.projectId !== undefined && !hasActiveFilters,
    refetchOnWindowFocus: false,
  });

  // 表示するセッション（フィルタ有無で切り替え）
  const sessions = useMemo(() => {
    if (hasActiveFilters) {
      return searchedSessionsData?.pages.flatMap((page) => page.sessions) ?? [];
    }
    return allSessionsData?.pages.flatMap((page) => page.sessions) ?? [];
  }, [hasActiveFilters, searchedSessionsData, allSessionsData]);

  const isSessionsLoading = hasActiveFilters ? isSearchLoading : isAllSessionsLoading;
  const hasNextPage = hasActiveFilters ? hasNextSearchPage : hasNextAllPage;
  const isFetchingNextPage = hasActiveFilters ? isFetchingNextSearchPage : isFetchingNextAllPage;

  // 現在選択中のセッションオブジェクト
  const currentSession = useMemo(() => {
    return sessions.find((s) => s.sessionId === service.sessionId) ?? null;
  }, [sessions, service.sessionId]);

  const handleLoadMore = useCallback(() => {
    if (hasActiveFilters) {
      if (hasNextSearchPage && !isFetchingNextSearchPage) {
        void fetchNextSearchPage();
      }
    } else {
      if (hasNextAllPage && !isFetchingNextAllPage) {
        void fetchNextAllPage();
      }
    }
  }, [hasActiveFilters, hasNextSearchPage, isFetchingNextSearchPage, fetchNextSearchPage, hasNextAllPage, isFetchingNextAllPage, fetchNextAllPage]);

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

  // モーダル開閉ハンドラー
  const handleOpenModal = useCallback(() => {
    setIsSessionModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsSessionModalOpen(false);
  }, []);

  // イベントバスからのモーダル開閉リクエストをリッスン
  useEffect(() => {
    const handleOpenFromEvent = () => {
      setIsSessionModalOpen(true);
    };
    heatMapEventBus.on('session-modal:open', handleOpenFromEvent);
    return () => {
      heatMapEventBus.off('session-modal:open', handleOpenFromEvent);
    };
  }, []);

  // フィルタ変更ハンドラー
  const handleFiltersChange = useCallback((newFilters: SessionFilters) => {
    setFilters(newFilters);
  }, []);

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

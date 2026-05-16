import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { SessionFilters } from '@src/features/heatmap/SessionPickerModal';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { DefaultStaleTime } from '@src/modeles/qeury';

const PAGE_SIZE = 50;

export function useSessionsList(service: HeatmapDataService) {
  // フィルタ状態
  const [filters, setFilters] = useState<SessionFilters>({
    searchQuery: '',
    deviceId: null,
    deviceIdEnabled: true, // embedモードでは初期でオン
  });

  // embed用の初期deviceId（現在のセッションのdeviceId）
  const [initialDeviceId, setInitialDeviceId] = useState<string | null>(null);

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

  return {
    filters,
    setFilters,
    initialDeviceId,
    sessions,
    currentSession,
    isSessionsLoading,
    hasNextPage,
    isFetchingNextPage,
    handleLoadMore,
  };
}

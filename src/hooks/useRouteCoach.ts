// src/hooks/useRouteCoach.ts
import { useCallback } from 'react';
import { useSelector, type EqualityFn } from 'react-redux';

import type { RouteCoachSettings } from '@src/slices/routeCoachSlice';
import type { RootState } from '@src/store';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { patchRouteCoach } from '@src/slices/routeCoachSlice';

// 単体値を取得（useGeneralSelect パターン）
export function useRouteCoachSelect<T>(selector: (s: RouteCoachSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((state: RootState) => selector(state.routeCoach), equalityFn);
}

// Partial 更新用（useGeneralPatch パターン）
export function useRouteCoachPatch() {
  const dispatch = useAppDispatch();
  return useCallback((patch: Partial<RouteCoachSettings>) => dispatch(patchRouteCoach(patch)), [dispatch]);
}

// selectedClusterId を取得する便利 Hook
export function useSelectedClusterId() {
  return useRouteCoachSelect((s) => s.selectedClusterId);
}

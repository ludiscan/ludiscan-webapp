// src/hooks/useHotspotMode.ts
import { useCallback } from 'react';
import { shallowEqual, useSelector, type EqualityFn } from 'react-redux';

import type { HotspotModeSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { patchHotspotMode } from '@src/slices/canvasSlice';

// 単体値 or 任意の派生値を取るためのセレクタ型
export function useHotspotModeSelect<T>(selector: (g: HotspotModeSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((s: RootState) => selector(s.heatmapCanvas.hotspotMode), equalityFn);
}

// 更新用: 部分更新を投げるだけ
export function useHotspotModePatch() {
  const dispatch = useAppDispatch();
  return useCallback((patch: Partial<HotspotModeSettings>) => dispatch(patchHotspotMode(patch)), [dispatch]);
}

// 2値以上をまとめて取りたい場合（shallow 比較）
export function useHotspotModePick<K extends keyof HotspotModeSettings>(...keys: K[]) {
  return useSelector((s: RootState) => {
    const g = s.heatmapCanvas.hotspotMode;
    const out = {} as Pick<HotspotModeSettings, K>;
    keys.forEach((k) => (out[k] = g[k]));
    return out;
  }, shallowEqual);
}

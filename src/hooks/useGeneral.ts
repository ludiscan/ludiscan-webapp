// src/hooks/useGeneral.ts
import { useCallback } from 'react';
import { shallowEqual, useSelector, type EqualityFn } from 'react-redux';

import type { GeneralSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { patchGeneral } from '@src/slices/canvasSlice';

// 単体値 or 任意の派生値を取るためのセレクタ型
export function useGeneralSelect<T>(selector: (g: GeneralSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((s: RootState) => selector(s.heatmapCanvas.general), equalityFn);
}

// 更新用: 部分更新を投げるだけ
export function useGeneralPatch() {
  const dispatch = useAppDispatch();
  return useCallback((patch: Partial<GeneralSettings>) => dispatch(patchGeneral(patch)), [dispatch]);
}

// 2値以上をまとめて取りたい場合（shallow 比較）
export function useGeneralPick<K extends keyof GeneralSettings>(...keys: K[]) {
  return useSelector((s: RootState) => {
    const g = s.heatmapCanvas.general;
    const out = {} as Pick<GeneralSettings, K>;
    keys.forEach((k) => (out[k] = g[k]));
    return out;
  }, shallowEqual);
}

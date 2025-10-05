// src/hooks/usePlayerTimeline.ts
import { shallowEqual, useSelector, type EqualityFn } from 'react-redux';

import type { PlayerTimelineSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { createSlicePatchHook } from '@src/hooks/createSlicePatchHook';
import { patchPlayerTimeline } from '@src/slices/canvasSlice';

// 単体値 or 任意の派生値を取るためのセレクタ型
export function usePlayerTimelineSelect<T>(selector: (g: PlayerTimelineSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((s: RootState) => selector(s.heatmapCanvas.playerTimeline), equalityFn);
}

const selTimeline = (s: RootState) => s.heatmapCanvas.playerTimeline;

export const usePlayerTimelinePatch = createSlicePatchHook<PlayerTimelineSettings>(selTimeline, patchPlayerTimeline);

// 2値以上をまとめて取りたい場合（shallow 比較）
export function usePlayerTimelinePick<K extends keyof PlayerTimelineSettings>(...keys: K[]) {
  return useSelector((s: RootState) => {
    const g = s.heatmapCanvas.playerTimeline;
    const out = {} as Pick<PlayerTimelineSettings, K>;
    keys.forEach((k) => (out[k] = g[k]));
    return out;
  }, shallowEqual);
}

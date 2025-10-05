// src/hooks/useEventLog.ts
import { shallowEqual, useSelector, type EqualityFn } from 'react-redux';

import type { EventLogSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { createSlicePatchHook } from '@src/hooks/createSlicePatchHook';
import { patchEventLog } from '@src/slices/canvasSlice';

// 単体値 or 任意の派生値を取るためのセレクタ型
export function useEventLogSelect<T>(selector: (g: EventLogSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((s: RootState) => selector(s.heatmapCanvas.eventLog), equalityFn);
}

const selEventLog = (s: RootState) => s.heatmapCanvas.eventLog;

export const useEventLogPatch = createSlicePatchHook<EventLogSettings>(selEventLog, patchEventLog);

// 2値以上をまとめて取りたい場合（shallow 比較）
export function useEventLogPick<K extends keyof EventLogSettings>(...keys: K[]) {
  return useSelector((s: RootState) => {
    const g = s.heatmapCanvas.eventLog;
    const out = {} as Pick<EventLogSettings, K>;
    keys.forEach((k) => (out[k] = g[k]));
    return out;
  }, shallowEqual);
}

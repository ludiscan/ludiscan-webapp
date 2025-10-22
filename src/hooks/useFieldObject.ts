// src/hooks/useFieldObject.ts
import { shallowEqual, useSelector, type EqualityFn } from 'react-redux';

import type { FieldObjectSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { createSlicePatchHook } from '@src/hooks/createSlicePatchHook';
import { patchFieldObject } from '@src/slices/canvasSlice';

// 単体値 or 任意の派生値を取るためのセレクタ型
export function useFieldObjectSelect<T>(selector: (g: FieldObjectSettings) => T, equalityFn?: EqualityFn<T>) {
  return useSelector((s: RootState) => selector(s.heatmapCanvas.fieldObject), equalityFn);
}

const selFieldObject = (s: RootState) => s.heatmapCanvas.fieldObject;

export const useFieldObjectPatch = createSlicePatchHook<FieldObjectSettings>(selFieldObject, patchFieldObject);

// 2値以上をまとめて取りたい場合（shallow 比較）
export function useFieldObjectPick<K extends keyof FieldObjectSettings>(...keys: K[]) {
  return useSelector((s: RootState) => {
    const g = s.heatmapCanvas.fieldObject;
    const out = {} as Pick<FieldObjectSettings, K>;
    keys.forEach((k) => (out[k] = g[k]));
    return out;
  }, shallowEqual);
}

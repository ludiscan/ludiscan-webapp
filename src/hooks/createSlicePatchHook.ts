// src/hooks/createSlicePatchHook.ts
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import type { RootState } from '@src/store';

import { useAppDispatch } from '@src/hooks/useDispatch';

type Updater<T> = Partial<T> | ((prev: T) => Partial<T> | T);

function shallowEqualObj<T extends object>(a: T, b: T) {
  if (a === b) return true;
  const ak = Object.keys(a) as (keyof T)[];
  const bk = Object.keys(b) as (keyof T)[];
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

/**
 * 任意 slice の patch 用フックを生成。
 * - prev は store.getState() のスナップショットから取得（購読しない）
 * - payload は常にオブジェクト（シリアラブル）
 * - 変化が無ければ dispatch をスキップ
 */
export function createSlicePatchHook<T extends object>(
  select: (s: RootState) => T,
  patchAction: ActionCreatorWithPayload<Partial<T>, string>,
  options?: {
    // 等価判定。指定しなければ shallow 比較
    equals?: (a: T, b: T) => boolean;
    // Partial をどうマージするか（デフォは浅いスプレッド）
    merge?: (prev: T, partial: Partial<T>) => T;
  },
) {
  const eq = options?.equals ?? shallowEqualObj<T>;
  const merge = options?.merge ?? ((prev: T, partial: Partial<T>) => ({ ...prev, ...partial }) as T);

  return function useSlicePatch() {
    const dispatch = useAppDispatch();
    const store = useStore<RootState>();

    return useCallback(
      (patchOrUpdater: Updater<T>) => {
        const prev = select(store.getState());

        // 関数なら prev を渡して次を作る。Partial でも T でも OK
        const ret = typeof patchOrUpdater === 'function' ? (patchOrUpdater as (p: T) => Partial<T> | T)(prev) : patchOrUpdater;

        // ret が T か Partial<T> かを気にせず、prev とマージして next を作る
        const partial = (ret ?? {}) as Partial<T>;
        const next = merge(prev, partial);

        if (eq(prev, next)) return; // 変化なしなら何もしない
        dispatch(patchAction(next)); // payload はオブジェクトなので安全
      },
      [dispatch, store],
    );
  };
}

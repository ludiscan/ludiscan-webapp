import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

import type { EventLogSettings, GeneralSettings, HeatmapDataState, HotspotModeSettings, PlayerTimelineSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { getInitialState, set } from '@src/slices/canvasSlice';
import { getCanvasValues } from '@src/utils/localstrage';
import { capitalize } from '@src/utils/string';

type keys = keyof HeatmapDataState & keyof RootState['heatmapCanvas'];

/**
 * @deprecated
 */
function useHeatmapValuesState<T extends HeatmapDataState[keys]>(key: keys) {
  // storeから現在のstate取得
  const data = useSelector((state: RootState) => state.heatmapCanvas[key]) as T;

  const dispatch = useDispatch();

  // session中の編集state（localStorageと同期はしていない）
  const [sessionData, setSessionData] = useState<T>(data);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (sessionData !== data) {
      setSessionData(data);
    }
  }, [data, sessionData]);

  const handleSetData = useCallback(
    (value: T | ((prevState: T) => T)) => {
      if (typeof value === 'function') {
        const newData = value(sessionData);
        if (newData === sessionData) return; // 値が変わらない場合は何もしない
        dispatch({ type: `heatmapCanvas/set${capitalize(key)}`, payload: newData });
      } else {
        dispatch({ type: `heatmapCanvas/set${capitalize(key)}`, payload: value });
      }
    },
    [dispatch, key, sessionData],
  );

  useEffect(() => {
    if (isMounted || isLoading) return;
    setIsLoading(true);
    const state = getInitialState();
    if (state[key] as T) {
      setSessionData(state[key] as T);
    }
    setIsLoading(false);
    setIsMounted(true);
  }, [isLoading, isMounted, key]);

  return {
    data: sessionData,
    setData: handleSetData,
    isLoading: isLoading,
    isMounted: isMounted,
  };
}

/**
 * @deprecated you can use {useGeneralSelect} or {useGeneralPatch}
 */
export const useGeneralState = () => useHeatmapValuesState<GeneralSettings>('general');
/**
 * @deprecated you can use {useHotspotModeSelect} or {useHotspotModePatch}
 */
export const useHotspotModeState = () => useHeatmapValuesState<HotspotModeSettings>('hotspotMode');
/**
 * @deprecated you can use {useEventLogSelect} or {useEventLogPatch}
 */
export const useEventLogState = () => useHeatmapValuesState<EventLogSettings>('eventLog');
/**
 * @deprecated you can use {useVersion}
 */
export const useVersion = () => useHeatmapValuesState<string | undefined>('version');
/**
 * @deprecated you can use {usePlayerTimelineSelect} or {usePlayerTimelinePatch}
 */
export const usePlayerTimelineState = () => useHeatmapValuesState<PlayerTimelineSettings>('playerTimeline');

// 速さや安定性が気になったら fast-deep-equal へ差し替え可
const deepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const useHeatmapState = () => {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();

  // localStorage のスナップショットを保持
  const savedRef = useRef<HeatmapDataState | null>(null);
  const [hasDiff, setHasDiff] = useState(false);

  // 初期読み込み
  useEffect(() => {
    savedRef.current = getCanvasValues() ?? null;
    const now = store.getState().heatmapCanvas;
    setHasDiff(!!savedRef.current && !deepEqual(savedRef.current, now));
  }, [store]);

  // Redux 変更を購読（コンポーネントは hasDiff が変わる時だけ再レンダー）
  useEffect(() => {
    return store.subscribe(() => {
      const now = store.getState().heatmapCanvas;
      const saved = savedRef.current;
      const nextHasDiff = !!saved && !deepEqual(saved, now);
      setHasDiff((prev) => (prev !== nextHasDiff ? nextHasDiff : prev));
    });
  }, [store]);

  // 現在の Redux 値を保存（set 内で saveCanvasValues が走る想定）
  const apply = useCallback(() => {
    const now = store.getState().heatmapCanvas; // ★その瞬間のスナップショット
    dispatch(set(now));
    savedRef.current = now;
    setHasDiff(false);
  }, [dispatch, store]);

  // 保存値で Redux を上書き（破棄）
  const discard = useCallback(() => {
    const saved = getCanvasValues();
    if (saved) {
      dispatch(set(saved));
      savedRef.current = saved;
      setHasDiff(false);
    }
  }, [dispatch]);

  return { apply, hasDiff, discard };
};

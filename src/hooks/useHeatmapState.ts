import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { EventLogSettings, GeneralSettings, HeatmapDataState, HotspotModeSettings, PlayerTimelineSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { useAppDispatch, useAppSelector } from '@src/hooks/useDispatch';
import { getInitialState, canvasActions } from '@src/slices/canvasSlice';
import { getCanvasValues } from '@src/utils/localstrage';
import { capitalize } from '@src/utils/string';

type keys = keyof HeatmapDataState & keyof RootState['heatmapCanvas'];

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

export const useGeneralState = () => useHeatmapValuesState<GeneralSettings>('general');
export const useHotspotModeState = () => useHeatmapValuesState<HotspotModeSettings>('hotspotMode');
export const useEventLogState = () => useHeatmapValuesState<EventLogSettings>('eventLog');
export const useVersion = () => useHeatmapValuesState<string | undefined>('version');
export const usePlayerTimelineState = () => useHeatmapValuesState<PlayerTimelineSettings>('playerTimeline');

export const useHeatmapState = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state: RootState) => state.heatmapCanvas);
  const [sessionData, setSessionData] = useState<HeatmapDataState>(data);

  const [hasDiff, setHasDiff] = useState<boolean>(false);

  useEffect(() => {
    // 初期化時にlocalStorageから値をロード
    const savedData = getCanvasValues();
    if (savedData) {
      setSessionData(savedData);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setSessionData(data);
      const savedData = getCanvasValues();
      if (savedData && JSON.stringify(savedData) !== JSON.stringify(data)) {
        setHasDiff(true);
      } else {
        setHasDiff(false);
      }
    }
  }, [data]);

  // session → storeへapply
  const apply = useCallback(() => {
    if (!sessionData) return;
    dispatch(canvasActions.set(sessionData));
  }, [dispatch, sessionData]);

  // discard → localStorageからロードしてsessionに反映
  const discard = useCallback(() => {
    const savedData = getCanvasValues();
    if (savedData) {
      setSessionData(savedData);
      setHasDiff(false);
    }
  }, []);

  return {
    general: sessionData.general,
    hotspotMode: sessionData.hotspotMode,
    eventLog: sessionData.eventLog,
    playerTimeline: sessionData.playerTimeline,
    hasDiff,
    version: sessionData.version,
    apply,
    discard,
  };
};

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { EventLogData, GeneralSettings, HeatmapDataState, HotspotModeSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

import { getInitialState, set } from '@src/slices/canvasSlice';
import { getCanvasValues } from '@src/utils/localstrage';
import { capitalize } from '@src/utils/string';

type keys = keyof HeatmapDataState & keyof RootState['canvas'];

function useHeatmapValuesState<T extends HeatmapDataState[keys]>(key: keys) {
  // storeから現在のstate取得
  const data = useSelector((state: RootState) => state.canvas[key]) as T;

  const dispatch = useDispatch();

  // session中の編集state（localStorageと同期はしていない）
  const [sessionData, setSessionData] = useState<T>(data);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setSessionData(data);
  }, [data]);

  const handleSetData = useCallback(
    (value: T) => {
      dispatch({ type: `heatmapCanvas/set${capitalize(key)}`, payload: value });
    },
    [dispatch, key],
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
export const useEventLogsState = () => useHeatmapValuesState<EventLogData[]>('eventLogs');
export const useVersion = () => useHeatmapValuesState<string | undefined>('version');

export const useHeatmapState = () => {
  const dispatch = useDispatch();
  const { data: generalData } = useGeneralState();
  const [general, setGeneral] = useState<GeneralSettings>(generalData);
  const { data: hotspotModeData } = useHotspotModeState();
  const [hotspotMode, setHotspotMode] = useState<HotspotModeSettings>(hotspotModeData);
  const { data: eventLogsData } = useEventLogsState();
  const [eventLogs, setEventLogs] = useState<EventLogData[]>(eventLogsData);
  const { data: version } = useVersion();

  useEffect(() => {
    // 初期化時にlocalStorageから値をロード
    const savedData = getCanvasValues();
    if (savedData) {
      setGeneral(savedData.general);
      setHotspotMode(savedData.hotspotMode);
      setEventLogs(savedData.eventLogs);
    }
  }, []);

  // session → storeへapply
  const apply = useCallback(() => {
    dispatch(
      set({
        general,
        hotspotMode,
        eventLogs,
      }),
    );
  }, [dispatch, eventLogs, general, hotspotMode]);

  // discard → localStorageからロードしてsessionに反映
  const discard = useCallback(() => {
    const savedData = getCanvasValues();
    if (savedData) {
      setGeneral(savedData.general);
      setHotspotMode(savedData.hotspotMode);
      setEventLogs(savedData.eventLogs);
    }
  }, []);

  return {
    general,
    hotspotMode,
    eventLogs,
    version,
    apply,
    discard,
  };
};

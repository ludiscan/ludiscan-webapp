import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { EventLogSettings, GeneralSettings, HeatmapDataState, HotspotModeSettings, PlayerTimelineSettings } from '@src/modeles/heatmapView';
import type { RootState } from '@src/store';

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
    setSessionData(data);
  }, [data]);

  const handleSetData = useCallback(
    (value: T | ((prevState: T) => T)) => {
      if (typeof value === 'function') {
        dispatch({ type: `heatmapCanvas/set${capitalize(key)}`, payload: value(sessionData) });
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
  const dispatch = useDispatch();
  const { data: generalData } = useGeneralState();
  const [general, setGeneral] = useState<GeneralSettings>(generalData);
  const { data: hotspotModeData } = useHotspotModeState();
  const [hotspotMode, setHotspotMode] = useState<HotspotModeSettings>(hotspotModeData);
  const { data: eventLogsData } = useEventLogState();
  const [eventLog, setEventLog] = useState<EventLogSettings>(eventLogsData);
  const { data: version } = useVersion();
  const { data: playerTimelineData } = usePlayerTimelineState();
  const [playerTimeline, setPlayerTimeline] = useState<PlayerTimelineSettings>(playerTimelineData);

  useEffect(() => {
    // 初期化時にlocalStorageから値をロード
    const savedData = getCanvasValues();
    if (savedData) {
      setGeneral(savedData.general);
      setHotspotMode(savedData.hotspotMode);
      setEventLog(savedData.eventLog);
      setPlayerTimeline(savedData.playerTimeline);
    }
  }, []);

  useEffect(() => {
    if (generalData) {
      setGeneral(generalData);
    }
  }, [generalData]);

  useEffect(() => {
    if (hotspotModeData) {
      setHotspotMode(hotspotModeData);
    }
  }, [hotspotModeData]);

  useEffect(() => {
    if (eventLogsData) {
      setEventLog(eventLogsData);
    }
  }, [eventLogsData]);

  useEffect(() => {
    if (playerTimelineData) {
      setPlayerTimeline(playerTimelineData);
    }
  }, [playerTimelineData]);

  // session → storeへapply
  const apply = useCallback(() => {
    dispatch(
      canvasActions.set({
        general,
        hotspotMode,
        eventLog,
        playerTimeline,
      }),
    );
  }, [dispatch, eventLog, general, hotspotMode, playerTimeline]);

  // discard → localStorageからロードしてsessionに反映
  const discard = useCallback(() => {
    const savedData = getCanvasValues();
    if (savedData) {
      setGeneral(savedData.general);
      setHotspotMode(savedData.hotspotMode);
      setEventLog(savedData.eventLog);
    }
  }, []);

  return {
    general,
    hotspotMode,
    eventLog,
    playerTimeline,
    version,
    apply,
    discard,
  };
};

import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../store';

import type { RootState } from '../store';
import type { CanvasEventValues } from '@src/slices/canvasSlice';

import { setEventLogs, getInitialState, set, setGeneral, setHotspotMode } from '@src/slices/canvasSlice';

export function useCanvasState() {
  const dispatch = useAppDispatch();
  const { hotspotMode, general, version, initialized, eventLogs } = useSelector((state: RootState) => state.canvas);

  const handleSetGeneral = useCallback(
    (value: CanvasEventValues['general']) => {
      dispatch(setGeneral(value));
    },
    [dispatch],
  );
  const handleSetHotspotMode = useCallback(
    (value: CanvasEventValues['hotspotMode']) => {
      dispatch(setHotspotMode(value));
    },
    [dispatch],
  );
  const handleSetEventLogs = useCallback(
    (value: CanvasEventValues['eventLogs']) => {
      dispatch(setEventLogs(value));
    },
    [dispatch],
  );

  useEffect(() => {
    if (initialized) return;
    const state = getInitialState();
    dispatch(set(state));
  }, [dispatch, initialized]);
  return {
    version,
    general,
    hotspotMode,
    eventLogs,
    setGeneral: handleSetGeneral,
    setHotspotMode: handleSetHotspotMode,
    setEventLogs: handleSetEventLogs,
  };
}

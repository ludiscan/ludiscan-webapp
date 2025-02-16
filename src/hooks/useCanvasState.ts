import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { CanvasEventValues } from '@/slices/canvasSlice.ts';
import type { RootState } from '@/store.ts';

import { setGeneral, setHotspotMode } from '@/slices/canvasSlice.ts';
import { useAppDispatch } from '@/store.ts';

export function useCanvasState() {
  const dispatch = useAppDispatch();
  const { hotspotMode, general, version } = useSelector((state: RootState) => state.canvas);

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
  return {
    version,
    general,
    hotspotMode,
    setGeneral: handleSetGeneral,
    setHotspotMode: handleSetHotspotMode,
  };
}

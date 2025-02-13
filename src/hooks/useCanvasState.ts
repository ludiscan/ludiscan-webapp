import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store.ts';

import { setScale, setUpZ } from '@/slices/canvasSlice.ts';
import { useAppDispatch } from '@/store.ts';

export function useCanvasState() {
  const dispatch = useAppDispatch();
  const { upZ, scale } = useSelector((state: RootState) => state.canvas);

  const handleSetUpZ = useCallback(
    (value: boolean) => {
      dispatch(setUpZ(value));
    },
    [dispatch],
  );
  const handleScale = useCallback(
    (value: number) => {
      dispatch(setScale(value));
    },
    [dispatch],
  );
  return {
    upZ,
    scale,
    setUpZ: handleSetUpZ,
    setScale: handleScale,
  };
}

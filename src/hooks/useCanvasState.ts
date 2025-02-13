import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store.ts';

import { setBlockSize, setScale, setShowHeatmap, setUpZ } from '@/slices/canvasSlice.ts';
import { useAppDispatch } from '@/store.ts';

export function useCanvasState() {
  const dispatch = useAppDispatch();
  const { upZ, scale, blockSize, showHeatmap } = useSelector((state: RootState) => state.canvas);

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
  const handleSetBlockSize = useCallback(
    (value: number) => {
      dispatch(setBlockSize(value));
    },
    [dispatch],
  );
  const handleSetShowHeatmap = useCallback(
    (value: boolean) => {
      dispatch(setShowHeatmap(value));
    },
    [dispatch],
  );
  return {
    upZ,
    scale,
    blockSize,
    showHeatmap,
    setUpZ: handleSetUpZ,
    setScale: handleScale,
    setBlockSize: handleSetBlockSize,
    setShowHeatmap: handleSetShowHeatmap,
  };
}

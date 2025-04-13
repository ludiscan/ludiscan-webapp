// src/slices/canvasSlice.ts

import { createSlice } from '@reduxjs/toolkit';

import packageJson from '../../package.json';

import type { PayloadAction } from '@reduxjs/toolkit';

import { getCanvasValues, saveCanvasValues } from '@src/utils/localstrage';

// Canvas の状態の型定義
export type CanvasEventValues = {
  version?: string;
  general: {
    upZ: boolean;
    scale: number;
    showHeatmap: boolean;
    blockSize: number;
    mapName: string;
  };
  hotspotMode: {
    visible: boolean;
    cellRadius: number;
    thresholdCount: number;
    skipNearDuplication: boolean;
  };
  initialized: boolean;
};

export const initializeValues: CanvasEventValues = {
  version: packageJson.version,
  general: {
    upZ: false,
    scale: 1,
    showHeatmap: false,
    blockSize: 1,
    mapName: '',
  },
  hotspotMode: {
    visible: false,
    cellRadius: 400,
    thresholdCount: 6,
    skipNearDuplication: true,
  },
  initialized: false,
};

export function getInitialState() {
  const saveState = getCanvasValues();
  if (saveState) {
    if (saveState.version === initializeValues.version) {
      return saveState;
    }
  }
  return initializeValues;
}

const canvasSlice = createSlice({
  name: 'heatmapCanvas',
  initialState: initializeValues,
  reducers: {
    set: (state, action: PayloadAction<CanvasEventValues>) => {
      state.version = action.payload.version;
      state.general = action.payload.general;
      state.hotspotMode = action.payload.hotspotMode;
    },
    setGeneral: (state, action: PayloadAction<CanvasEventValues['general']>) => {
      state.general = action.payload;
      saveCanvasValues(state);
    },
    setHotspotMode: (state, action: PayloadAction<CanvasEventValues['hotspotMode']>) => {
      state.hotspotMode = action.payload;
      saveCanvasValues(state);
    },
  },
});

export const { setGeneral, setHotspotMode, set } = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;

// src/slices/canvasSlice.ts

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { HeatmapDataState } from '@src/modeles/heatmapView';

import { initializeValues } from '@src/modeles/heatmapView';
import { getCanvasValues, saveCanvasValues } from '@src/utils/localstrage';

export function getInitialState(): HeatmapDataState {
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
    set: (state, action: PayloadAction<HeatmapDataState>) => {
      state.version = action.payload.version;
      state.general = action.payload.general;
      state.hotspotMode = action.payload.hotspotMode;
      state.eventLog = action.payload.eventLog;
      saveCanvasValues(state);
    },
    setGeneral: (state, action: PayloadAction<HeatmapDataState['general']>) => {
      state.general = action.payload;
    },
    setHotspotMode: (state, action: PayloadAction<HeatmapDataState['hotspotMode']>) => {
      state.hotspotMode = action.payload;
    },
    setEventLog: (state, action: PayloadAction<HeatmapDataState['eventLog']>) => {
      state.eventLog = action.payload;
    },
    setPlayerTimeline: (state, action: PayloadAction<HeatmapDataState['playerTimeline']>) => {
      state.playerTimeline = action.payload;
    },
  },
});

export const { set } = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;

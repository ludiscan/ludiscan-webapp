// src/slices/canvasSlice.ts

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { HeatmapDataState, PlayerTimelineSettings, FieldObjectSettings } from '@src/modeles/heatmapView';

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
  initialState: getInitialState(),
  reducers: {
    set: (state, action: PayloadAction<HeatmapDataState>) => {
      state.version = action.payload.version;
      state.general = action.payload.general;
      state.hotspotMode = action.payload.hotspotMode;
      state.eventLog = action.payload.eventLog;
      state.fieldObject = action.payload.fieldObject;
      state.splitMode = action.payload.splitMode;
      saveCanvasValues(state);
    },
    setGeneral: (state, action: PayloadAction<HeatmapDataState['general']>) => {
      state.general = action.payload;
    },
    patchGeneral: (state, action: PayloadAction<Partial<HeatmapDataState['general']>>) => {
      state.general = { ...state.general, ...action.payload };
    },
    setHotspotMode: (state, action: PayloadAction<HeatmapDataState['hotspotMode']>) => {
      state.hotspotMode = action.payload;
    },
    patchHotspotMode: (state, action: PayloadAction<Partial<HeatmapDataState['hotspotMode']>>) => {
      state.hotspotMode = { ...state.hotspotMode, ...action.payload };
    },

    setEventLog: (state, action: PayloadAction<HeatmapDataState['eventLog']>) => {
      state.eventLog = action.payload;
    },
    patchEventLog: (state, action: PayloadAction<Partial<HeatmapDataState['eventLog']>>) => {
      state.eventLog = { ...state.eventLog, ...action.payload };
    },

    setPlayerTimeline: (state, action: PayloadAction<HeatmapDataState['playerTimeline']>) => {
      state.playerTimeline = action.payload;
    },
    patchPlayerTimeline: (state, action: PayloadAction<Partial<PlayerTimelineSettings>>) => {
      state.playerTimeline = { ...state.playerTimeline, ...action.payload };
    },
    updatePlayerTimeline: (state, action: PayloadAction<(prev: PlayerTimelineSettings) => PlayerTimelineSettings>) => {
      state.playerTimeline = action.payload(state.playerTimeline);
    },

    setFieldObject: (state, action: PayloadAction<HeatmapDataState['fieldObject']>) => {
      state.fieldObject = action.payload;
    },
    patchFieldObject: (state, action: PayloadAction<Partial<FieldObjectSettings>>) => {
      state.fieldObject = { ...state.fieldObject, ...action.payload };
    },

    setSplitMode: (state, action: PayloadAction<HeatmapDataState['splitMode']>) => {
      state.splitMode = action.payload;
    },
    patchSplitMode: (state, action: PayloadAction<Partial<HeatmapDataState['splitMode']>>) => {
      state.splitMode = { ...state.splitMode, ...action.payload };
    },
  },
});

export const {
  set,
  setGeneral,
  patchGeneral,
  setHotspotMode,
  patchHotspotMode,
  setEventLog,
  patchEventLog,
  setPlayerTimeline,
  patchPlayerTimeline,
  updatePlayerTimeline,
  setFieldObject,
  patchFieldObject,
  setSplitMode,
  patchSplitMode,
} = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;

// src/features/selection/selectionSlice.ts
import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

export type Vec3 = { x: number; y: number; z: number };

export type Selection =
  | { kind: 'map-mesh'; uuid: string; name?: string; worldPosition: Vec3 }
  | { kind: 'heatmap-cell'; index: number; worldPosition: Vec3; density?: number }
  | {
      kind: 'player-arrow';
      playerId: string;
      tick: number;
      worldPosition: Vec3;
      liveRefKey?: string;
    }
  | { kind: 'point'; worldPosition: Vec3; label?: string };

export type FocusTarget =
  | { type: 'object'; uuid: string; padding?: number }
  | { type: 'box'; box: { min: Vec3; max: Vec3 }; padding?: number }
  | { type: 'sphere'; center: Vec3; radius: number }
  | { type: 'point'; point: Vec3; keepDistance?: boolean }
  | { type: 'follow'; liveRefKey: string; keepDistance?: boolean; smooth?: number };

type SelectionState = {
  selected: Selection | null;
  focusTarget: FocusTarget | null;
};

const initialState: SelectionState = {
  selected: null,
  focusTarget: null,
};

const slice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelected(state, action: PayloadAction<Selection | null>) {
      state.selected = action.payload;
    },
    setFocusTarget(state, action: PayloadAction<FocusTarget | null>) {
      state.focusTarget = action.payload;
    },
    followLive(state, action: PayloadAction<{ liveRefKey: string; keepDistance?: boolean; smooth?: number }>) {
      const { liveRefKey, keepDistance, smooth } = action.payload;
      state.focusTarget = { type: 'follow', liveRefKey, keepDistance, smooth };
    },
    stopFollow(state) {
      if (state.focusTarget?.type === 'follow') state.focusTarget = null;
    },
    focusByCoord(state, action: PayloadAction<{ point: Vec3; openInspector?: boolean; keepDistance?: boolean; label?: string }>) {
      const { point, openInspector, keepDistance, label } = action.payload;
      state.focusTarget = { type: 'point', point, keepDistance };
      if (openInspector) {
        state.selected = { kind: 'point', worldPosition: point, label };
      }
    },
    clear(state) {
      state.selected = null;
      state.focusTarget = null;
    },
  },
});

export const { setSelected, setFocusTarget, focusByCoord, clear, followLive, stopFollow } = slice.actions;
export const selectionReducer = slice.reducer;

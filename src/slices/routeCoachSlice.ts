// src/slices/routeCoachSlice.ts

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

export interface RouteCoachSettings {
  selectedClusterId: number | null;
}

const initialState: RouteCoachSettings = {
  selectedClusterId: null,
};

const routeCoachSlice = createSlice({
  name: 'routeCoach',
  initialState,
  reducers: {
    setRouteCoach: (state, action: PayloadAction<RouteCoachSettings>) => {
      state.selectedClusterId = action.payload.selectedClusterId;
    },
    patchRouteCoach: (state, action: PayloadAction<Partial<RouteCoachSettings>>) => {
      if (action.payload.selectedClusterId !== undefined) {
        state.selectedClusterId = action.payload.selectedClusterId;
      }
    },
  },
});

export const { setRouteCoach, patchRouteCoach } = routeCoachSlice.actions;
export const routeCoachReducer = routeCoachSlice.reducer;

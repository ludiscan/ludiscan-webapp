// src/slices/uiSlice.ts
// Session-only UI state (not persisted to localStorage)

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type UiState = {
  menuPanelWidth: number;
};

const initialState: UiState = {
  menuPanelWidth: 400,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMenuPanelWidth: (state, action: PayloadAction<number>) => {
      state.menuPanelWidth = action.payload;
    },
  },
});

export const { setMenuPanelWidth } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

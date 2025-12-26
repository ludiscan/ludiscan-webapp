// src/slices/uiSlice.ts
// Session-only UI state (not persisted to localStorage)

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

type UiState = {
  menuPanelWidth: number;
  menuPanelCollapsed: boolean;
};

const initialState: UiState = {
  menuPanelWidth: 400,
  menuPanelCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMenuPanelWidth: (state, action: PayloadAction<number>) => {
      state.menuPanelWidth = action.payload;
    },
    setMenuPanelCollapsed: (state, action: PayloadAction<boolean>) => {
      state.menuPanelCollapsed = action.payload;
    },
    toggleMenuPanelCollapsed: (state) => {
      state.menuPanelCollapsed = !state.menuPanelCollapsed;
    },
  },
});

export const { setMenuPanelWidth, setMenuPanelCollapsed, toggleMenuPanelCollapsed } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

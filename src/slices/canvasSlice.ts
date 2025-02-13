// src/slices/canvasSlice.ts

import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';

import { getCanvasValues, saveCanvasValues } from '@/utils/localstrage'; // localStorage から読み込む関数

// Canvas の状態の型定義
export type CanvasEventValues = {
  upZ: boolean;
  scale: number;
};

// localStorage に保存されている値を初期状態として利用
const initialState: CanvasEventValues = getCanvasValues();

const canvasSlice = createSlice({
  name: 'heatmapCanvas',
  initialState,
  reducers: {
    // 引数で指定された値に更新
    setUpZ(state, action: PayloadAction<boolean>) {
      state.upZ = action.payload;
      saveCanvasValues(state);
    },
    // scale の更新
    setScale(state, action: PayloadAction<number>) {
      state.scale = action.payload;
      saveCanvasValues(state);
    },
  },
});

export const { setUpZ, setScale } = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@src/slices/authSlice';
import { canvasReducer } from '@src/slices/canvasSlice';

export const store = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      heatmapCanvas: canvasReducer,
    },
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

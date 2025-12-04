import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@src/slices/authSlice';
import { canvasReducer } from '@src/slices/canvasSlice';
import { routeCoachReducer } from '@src/slices/routeCoachSlice';
import { selectionReducer } from '@src/slices/selectionSlice';
import { uiReducer } from '@src/slices/uiSlice';

export const store = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      heatmapCanvas: canvasReducer,
      selection: selectionReducer,
      routeCoach: routeCoachReducer,
      ui: uiReducer,
    },
  });
};

export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

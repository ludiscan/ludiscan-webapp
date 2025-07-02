import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { authReducer } from '@src/slices/authSlice';
import { canvasReducer } from '@src/slices/canvasSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    heatmapCanvas: canvasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

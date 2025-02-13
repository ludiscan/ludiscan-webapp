import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { authReducer } from './slices/authSlice.ts';

import { canvasReducer } from '@/slices/canvasSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    canvas: canvasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

import type { HeatmapDataState } from '@src/modeles/heatmapView';
import type { User } from '@src/modeles/user';

import { initializeValues } from '@src/modeles/heatmapView';

const STORAGE_KEY = 'ludiscan';

export function saveToken(token: string): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, token }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
  }
}

export function getToken(): string | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).token || null;
  }
  return null;
}

export function saveUser(user: User | null): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, user }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
  }
}

export function getUser(): User | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).user || null;
  }
  return null;
}

export function saveCanvasValues(canvas: HeatmapDataState) {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, canvas }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvas }));
  }
}

export function getCanvasValues(): HeatmapDataState | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage && JSON.parse(storage).canvas) {
    return JSON.parse(storage).canvas;
  }
  return null;
}

export function saveCanvasPartial<T>(key: keyof HeatmapDataState, value: T) {
  const storage = getCanvasValues() ?? initializeValues;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...storage, [key]: value }));
}

export function loadCanvasPartial<T>(key: keyof HeatmapDataState): T {
  const storage = getCanvasValues();
  if (storage) return storage[key] as T;
  throw new Error(`No data for key: ${key}`);
}

import type { HeatmapDataState } from '@src/modeles/heatmapView';
import type { ThemeType } from '@src/modeles/theme';
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

export function saveThemeName(theme: 'light' | 'dark'): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, theme }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme }));
  }
}

export function getThemeName(): 'light' | 'dark' | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).theme || null;
  }
  return null;
}

export function saveThemeType(themeType: ThemeType): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, themeType }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeType }));
  }
}

export function getThemeType(): ThemeType | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).themeType || null;
  }
  return null;
}

const MAX_RECENT_MENUS = 5;

export function saveRecentMenu(menuName: string): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  const data = storage ? JSON.parse(storage) : {};
  const recentMenus: string[] = data.recentMenus || [];

  // Remove the menu if it already exists to avoid duplicates
  const filteredMenus = recentMenus.filter((name) => name !== menuName);

  // Add the menu to the beginning of the array
  const updatedMenus = [menuName, ...filteredMenus].slice(0, MAX_RECENT_MENUS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, recentMenus: updatedMenus }));
}

export function getRecentMenus(): string[] {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    return data.recentMenus || [];
  }
  return [];
}

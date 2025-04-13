import type { User } from '@src/modeles/user';
import type { CanvasEventValues } from '@src/slices/canvasSlice';

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

export function saveCanvasValues(canvas: CanvasEventValues) {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, canvas }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvas }));
  }
}

export function getCanvasValues(): CanvasEventValues | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage && JSON.parse(storage).canvas) {
    return JSON.parse(storage).canvas;
  }
  return null;
}

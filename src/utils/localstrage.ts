import type { User } from '@/modeles/user.ts';

const STORAGE_KEY = 'ludiscan';

export function saveToken(token: string): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    data.token = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
  }
}

export function getToken(): string | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).token;
  }
  return null;
}

export function saveUser(user: User): void {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    const data = JSON.parse(storage);
    data.user = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
  }
}

export function getUser(): User | null {
  const storage = localStorage.getItem(STORAGE_KEY);
  if (storage) {
    return JSON.parse(storage).user;
  }
  return null;
}

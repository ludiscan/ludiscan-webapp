import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { User } from '@/modeles/user.ts';
import type { RootState } from '@/store.ts';

import { login, logout } from '@/slices/authSlice.ts';
import { useAppDispatch } from '@/store.ts';

export type UseAuthType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  login: (values: LoginType) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

type LoginType = {
  email: string;
  password: string;
};

export type UseAuthOptions = {
  onSuccessLogin?: () => void | Promise<void>;
  onErrorLogin?: (error: string) => void | Promise<void>;
};

export function useAuth(props?: UseAuthOptions): UseAuthType {
  const dispatch = useAppDispatch();
  const { token, user, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(
    async (values: LoginType) => {
      const { email, password } = values;
      // login アクションを dispatch し、成功時には追加の処理（onSuccessLogin 相当）も行えます
      const resultAction = await dispatch(login({ email, password }));
      if (login.fulfilled.match(resultAction)) {
        if (props?.onSuccessLogin) {
          await props.onSuccessLogin();
        }
      } else {
        if (props?.onErrorLogin) {
          await props.onErrorLogin(resultAction.payload as string);
        }
      }
    },
    [dispatch, props],
  );

  const handleLogout = useCallback(async () => {
    dispatch(logout());
  }, [dispatch]);
  return {
    token,
    user,
    isLoading: isLoading,
    isAuthorized: token !== null && token !== '',
    login: handleLogin,
    logout: handleLogout,
    error,
  };
}

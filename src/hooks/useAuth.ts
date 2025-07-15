import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import type { Env } from '@src/modeles/env';
import type { User } from '@src/modeles/user';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { login, logout, setReady, setToken, setUser } from '@src/slices/authSlice';
import { getToken, getUser } from '@src/utils/localstrage';

export type UseAuthType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  login: (values: LoginType) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  ready: boolean;
};

type LoginType = {
  email: string;
  password: string;
};

export type UseAuthOptions = {
  env?: Env | undefined;
  onSuccessLogin?: () => void | Promise<void>;
  onErrorLogin?: (error: string) => void | Promise<void>;
};

export function useAuth(props?: UseAuthOptions): UseAuthType {
  const dispatch = useAppDispatch();
  const { token, user, isLoading, error, ready } = useSelector((state: RootState) => state.auth);

  const handleLogin = useCallback(
    async (values: LoginType) => {
      const { email, password } = values;
      if (!props?.env) return;
      // login アクションを dispatch し、成功時には追加の処理（onSuccessLogin 相当）も行えます
      const resultAction = await dispatch(login({ env: props.env, email, password }));
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

  useEffect(() => {
    if (token || user) return;
    const t = getToken();
    const u = getUser();
    if (t && u) {
      dispatch(setUser(u));
      dispatch(setToken(t));
    }
    dispatch(setReady(true));
  }, [dispatch, token, user]);

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
    ready,
  };
}

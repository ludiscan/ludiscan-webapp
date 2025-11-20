import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../store';
import type { User } from '@src/modeles/user';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { checkSession, login, logout, setUser } from '@src/slices/authSlice';
import { getUser } from '@src/utils/localstrage';

export type UseAuthType = {
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
  onSuccessLogin?: () => void | Promise<void>;
  onErrorLogin?: (error: string) => void | Promise<void>;
};

export function useAuth(props?: UseAuthOptions): UseAuthType {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, ready } = useSelector((state: RootState) => state.auth);

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

  // Check session on mount (validates httpOnly cookie)
  useEffect(() => {
    if (user || ready) return;

    // Try to restore from localStorage first (for UX)
    const storedUser = getUser();
    if (storedUser) {
      dispatch(setUser(storedUser));
    }

    // Then validate session with server
    dispatch(checkSession());
  }, [dispatch, user, ready]);

  const handleLogout = useCallback(async () => {
    await dispatch(logout());
  }, [dispatch]);

  return {
    user,
    isLoading: isLoading,
    isAuthorized: user !== null,
    login: handleLogin,
    logout: handleLogout,
    error,
    ready,
  };
}

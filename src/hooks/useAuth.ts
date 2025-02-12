import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import type { User } from '@/modeles/user.ts';

import { query } from '@/modeles/qeury.ts';
import { getToken, getUser, saveToken, saveUser } from '@/utils/localstrage.ts';

export type UseAuthType = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthorized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: Error | null;
};

type LoginType = {
  email: string;
  password: string;
};

export type UseAuthOptions = {
  onSuccessLogin?: () => void | Promise<void>;
};

export function useAuth(props?: UseAuthOptions): UseAuthType {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      setToken(token);
      setUser(user);
    }
    setIsInitialized(true);
  }, []);

  const {
    mutateAsync: loginMutation,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationKey: ['login'],
    mutationFn: async (login: LoginType) => {
      const { email, password } = login;
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }
      const res = await query.POST('/api/v0/login', {
        body: {
          email,
          password,
        },
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      saveToken(res.data.accessToken);
      setToken(res.data.accessToken);
      saveUser(res.data.user);
      setUser(res.data.user);
      return res.data;
    },
    onSuccess: (data) => {
      if (props?.onSuccessLogin && data.accessToken && data.user) {
        props.onSuccessLogin();
      }
    },
  });

  const onLogin = useCallback(
    async (email: string, password: string) => {
      await loginMutation({ email, password });
    },
    [loginMutation],
  );

  const onLogout = useCallback(async () => {
    setToken(null);
    saveToken('');
    setUser(null);
    saveUser(null);
  }, []);

  return {
    token,
    user,
    isLoading: isLoading || !isInitialized,
    isAuthorized: token !== null && token !== '',
    login: onLogin,
    logout: onLogout,
    error,
  };
}

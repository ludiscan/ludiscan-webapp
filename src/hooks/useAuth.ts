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
  login: (email: string, password: string) => Promise<boolean>;
};

type LoginType = {
  email: string;
  password: string;
};

export function useAuth(): UseAuthType {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      setToken(token);
      setUser(user);
    }
  }, []);

  const { mutateAsync: loginMutation, isPending: isLoading } = useMutation({
    mutationFn: async (login: LoginType) => {
      const { email, password } = login;
      if (!email || !password) {
        return false;
      }
      const res = await query.POST('/api/v0/login', {
        body: {
          email,
          password,
        },
      });
      if (res.error) {
        return false;
      }
      saveToken(res.data.access_token);
      setToken(res.data.access_token);
      saveUser(res.data.user);
      setUser(res.data.user);
      return true;
    },
  });

  const onLogin = useCallback(
    async (email: string, password: string) => {
      return loginMutation({ email, password });
    },
    [loginMutation],
  );

  return { token, user, isLoading, isAuthorized: !!token, login: onLogin };
}

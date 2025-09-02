import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { Env } from '@next/env';
import type { GetServerSideProps } from 'next';

import { createClient, DefaultStaleTime } from '@src/modeles/qeury';
import { saveToken, saveUser } from '@src/utils/localstrage';

type SocialCallbackProps = {
  env?: Env;
  token?: string;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = typeof ctx.query.token === 'string' ? ctx.query.token : null;
  const { env } = await import('@src/config/env');
  // A方式（localStorage保存）でも、ここで token をクライアントに渡して同ページで処理するのがシンプル
  return {
    props: {
      env,
      token,
    },
  };
};

export default function SocialCallback({ env, token }: SocialCallbackProps) {
  // クライアントで保存＆/auth/me 取得
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['getMe', env, token],
    queryFn: async () => {
      if (!env || !token) return;
      saveToken(token);
      const { data, error } = await createClient().GET('/api/v0/login/profile');
      if (error) return;
      return data;
    },
    enabled: !!env && !!token,
    retry: false,
    staleTime: DefaultStaleTime,
  });
  useEffect(() => {
    if (isError || isLoading) {
      return;
    }
    if (token && user) {
      saveToken(token);
      saveUser(user);
      window.location.replace('/'); // 任意の遷移先
    }
  }, [user, token, isError, isLoading]);
  return <div style={{ padding: 24 }}>Signing you in…</div>;
}

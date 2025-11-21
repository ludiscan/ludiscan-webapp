import createClientFetch from 'openapi-fetch';

import type { paths } from '@generated/api';
import type { Middleware } from 'openapi-fetch';

import { env } from '@src/config/env';
import { getToken } from '@src/utils/localstrage';

export const DefaultStaleTime = 1000 * 60 * 5; // 5 minutes

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    // SSRガード
    if (typeof window !== 'undefined') {
      const token = getToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  async onError({ error }) {
    // wrap errors thrown by fetch
    throw error;
  },
};

export const createClient = () => {
  const apiClient = createClientFetch<paths>({
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.use(myMiddleware);

  return apiClient;
};

/**
 * Embed用のAPIクライアントを作成
 * x-embed-tokenヘッダーを使用して認証
 */
export const createEmbedClient = (embedToken: string) => {
  const embedMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set('x-embed-token', embedToken);
      return request;
    },
    async onError({ error }) {
      throw error;
    },
  };

  const apiClient = createClientFetch<paths>({
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.use(embedMiddleware);

  return apiClient;
};

import createClientFetch from 'openapi-fetch';

import type { paths } from '@generated/api';
import type { Middleware } from 'openapi-fetch';

import { env } from '@src/config/env';

export const DefaultStaleTime = 1000 * 60 * 5; // 5 minutes

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    // FormData送信時はContent-Typeを削除（ブラウザが自動でmultipart/form-data; boundary=...を設定）
    // カスタムヘッダー X-Upload-FormData が設定されている場合にContent-Typeを削除
    if (request.headers.get('X-Upload-FormData')) {
      request.headers.delete('Content-Type');
      request.headers.delete('X-Upload-FormData');
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
  apiClient.use(myMiddleware);

  return apiClient;
};

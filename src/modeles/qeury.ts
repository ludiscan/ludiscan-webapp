import createClientFetch from 'openapi-fetch';

import type { paths } from '@generated/api';
import type { Env } from '@src/modeles/env';
import type { Middleware } from 'openapi-fetch';

import { getToken } from '@src/utils/localstrage';

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    if (localStorage) {
      const token = getToken();
      if (token) {
        request.headers.set('Authorization', 'Bearer ' + token);
      }
    }
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      // Will produce error messages like "https://example.org/api/v1/example: 404 Not Found".
      throw new Error(`${response.url}: ${response.status} ${response.statusText}`);
    }
  },
  async onError({ error }) {
    // wrap errors thrown by fetch
    return new Error('Oops, fetch failed ' + error);
  },
};

export const createClient = (env: Env) => {
  const apiClient = createClientFetch<paths>({
    baseUrl: env.API_BASE_URL || 'http://localhost',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.use(myMiddleware);

  return apiClient;
};

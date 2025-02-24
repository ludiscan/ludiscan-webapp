import createClient from 'openapi-fetch';

import type { paths } from '../../generated/api.ts';
import type { Middleware } from 'openapi-fetch';

import { getToken } from '@/utils/localstrage.ts';

const query = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_HOSTNAME || 'http://localhost',
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    console.error('Oops, fetch failed', error);
    return new Error('Oops, fetch failed ' + error);
  },
};

query.use(myMiddleware);

export { query };

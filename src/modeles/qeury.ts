import createClient from 'openapi-fetch';

import type { paths } from '../../generated/api.ts';
import type { Middleware } from 'openapi-fetch';

import { getToken } from '@/utils/localstrage.ts';

const query = createClient<paths>({
  baseUrl: 'https://matuyuhi.com',
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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
};

query.use(myMiddleware);

export { query };

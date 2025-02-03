import createClient from 'openapi-fetch';

import type { paths } from '../../generated/api.ts';
import type { Middleware } from 'openapi-fetch';

const query = createClient<paths>({
  baseUrl: 'https://matuyuhi.com',
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    if (request.method === 'POST') {
      request = new Request(request, { headers: { 'Content-Type': 'application/json' } });
    }
    return request;
  },
};


query.use(myMiddleware);

export { query };

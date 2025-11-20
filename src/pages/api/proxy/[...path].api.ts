import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '@src/config/env';
import { getCookie, COOKIE_NAMES } from '@src/utils/security/cookies';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * Generic API Proxy Route
 *
 * Proxies authenticated requests to the backend API, automatically adding
 * the authentication token from httpOnly cookies.
 *
 * This allows the client to make API calls without directly handling tokens,
 * improving security by preventing XSS attacks on the token.
 *
 * Usage:
 * Client calls: /api/proxy/v0/user/me
 * Proxied to: ${API_BASE_URL}/api/v0/user/me
 *
 * Security features:
 * - Rate limiting
 * - Automatic token injection from httpOnly cookies
 * - CSRF validation (could be added)
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.API)(req, res);
  if (!rateLimit.allowed) return;

  try {
    const { path } = req.query;

    // Validate path
    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    // Construct backend API URL
    const apiPath = path.join('/');
    const backendUrl = `${env.NEXT_PUBLIC_API_BASE_URL}/api/${apiPath}`;

    // Get auth token from httpOnly cookie
    const authToken = getCookie(req.headers.cookie, COOKIE_NAMES.AUTH_TOKEN);

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Add authorization header if token exists
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Forward request to backend API
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Get response data
    const data = await backendResponse.json().catch(() => null);

    // Forward status code and response
    return res.status(backendResponse.status).json(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[API Proxy] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

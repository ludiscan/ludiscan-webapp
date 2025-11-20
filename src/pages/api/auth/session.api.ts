import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '@src/config/env';
import { getCookie, COOKIE_NAMES } from '@src/utils/security/cookies';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * Session API Route
 *
 * Returns current user session information by verifying the auth token.
 * This endpoint fetches user data from the backend API using the httpOnly cookie.
 *
 * Security: Rate limited to prevent session checking abuse
 */

interface SessionResponse {
  user: {
    id: string;
    email: string;
    name: string;
    // Add other user fields as needed
  };
  authenticated: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SessionResponse | { authenticated: false } | { error: string }>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.API)(req, res);
  if (!rateLimit.allowed) return;

  try {
    // Get auth token from httpOnly cookie
    const authToken = getCookie(req.headers.cookie, COOKIE_NAMES.AUTH_TOKEN);

    // eslint-disable-next-line no-console
    console.log('[Auth] Session check - Cookie found:', !!authToken);

    if (!authToken) {
      // eslint-disable-next-line no-console
      console.log('[Auth] Session check - No auth token in cookie');
      return res.status(200).json({ authenticated: false });
    }

    // Verify token with backend API (use same endpoint as social-callback)
    const apiUrl = `${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/login/profile`;
    // eslint-disable-next-line no-console
    console.log('[Auth] Session check - Verifying with backend:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    // eslint-disable-next-line no-console
    console.log('[Auth] Session check - Backend response status:', apiResponse.status);

    if (!apiResponse.ok) {
      // Token is invalid or expired
      // eslint-disable-next-line no-console
      console.log('[Auth] Session check - Token validation failed');
      return res.status(200).json({ authenticated: false });
    }

    const userData = await apiResponse.json();
    // eslint-disable-next-line no-console
    console.log('[Auth] Session check - Success, user:', userData.email || userData.id);

    return res.status(200).json({
      user: userData,
      authenticated: true,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Session check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

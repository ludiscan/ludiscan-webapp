import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '@src/config/env';
import { setAuthToken, setCsrfToken } from '@src/utils/security/cookies';
import { generateCsrfToken } from '@src/utils/security/csrf';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * Social Login Callback API Route
 *
 * This endpoint handles OAuth callbacks from social providers (Google, etc.)
 * and sets httpOnly cookies for secure token storage.
 *
 * Flow:
 * 1. Backend redirects to: /api/auth/social-callback?token=<access_token>&redirect=<redirect_url>
 * 2. This API sets httpOnly cookie with the token
 * 3. Redirects to the client page which validates the session
 *
 * Security features:
 * - Rate limiting
 * - httpOnly cookies for token storage
 * - CSRF token generation
 * - Secure cookie settings (sameSite, secure)
 */

interface SocialCallbackQuery {
  token?: string;
  redirect?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.AUTH)(req, res);
  if (!rateLimit.allowed) return;

  try {
    const { token, redirect } = req.query as SocialCallbackQuery;

    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - Received request, token present:', !!token);

    // Validate token parameter
    if (!token || typeof token !== 'string') {
      // eslint-disable-next-line no-console
      console.log('[Auth] Social callback - Missing or invalid token');
      return res.status(400).json({ error: 'Missing or invalid token parameter' });
    }

    // Validate token by fetching user profile from backend
    const apiUrl = `${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/login/profile`;
    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - Validating token with:', apiUrl);

    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - Backend response status:', apiResponse.status);

    if (!apiResponse.ok) {
      // eslint-disable-next-line no-console
      console.log('[Auth] Social callback - Token validation failed');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userData = await apiResponse.json();
    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - User data received:', userData.email || userData.id);

    if (!userData) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set httpOnly cookies for security
    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - Setting httpOnly cookies');
    setAuthToken(res, token);
    setCsrfToken(res, csrfToken);

    // Determine redirect URL (default to callback success page)
    const redirectUrl = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/auth/social-callback';
    // eslint-disable-next-line no-console
    console.log('[Auth] Social callback - Cookies set, redirecting to:', redirectUrl);

    // Return HTML page that redirects client-side
    // This ensures cookies are set before navigation
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authenticating...</title>
        </head>
        <body>
          <p>Authenticating... Please wait.</p>
          <script>
            // Wait a moment to ensure cookies are set, then redirect
            setTimeout(function() {
              window.location.href = '${redirectUrl}';
            }, 100);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Social callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

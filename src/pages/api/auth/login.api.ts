import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '@src/config/env';
import { setAuthToken, setCsrfToken } from '@src/utils/security/cookies';
import { generateCsrfToken } from '@src/utils/security/csrf';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * Login API Route
 *
 * This endpoint proxies authentication to the backend API and sets httpOnly cookies
 * for secure token storage, preventing XSS attacks.
 *
 * Security features:
 * - Rate limiting (5 requests per minute)
 * - httpOnly cookies for token storage
 * - CSRF token generation
 * - Secure cookie settings (sameSite, secure)
 */

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    // Add other user fields as needed
  };
  csrfToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse | { error: string }>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.AUTH)(req, res);
  if (!rateLimit.allowed) return;

  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Call backend API for authentication
    const apiResponse = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return res.status(apiResponse.status).json({
        error: errorData.message || 'Authentication failed',
      });
    }

    const data = await apiResponse.json();

    // Validate response structure
    if (!data.accessToken || !data.user) {
      return res.status(500).json({ error: 'Invalid response from authentication server' });
    }

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set httpOnly cookies for security
    setAuthToken(res, data.accessToken);
    setCsrfToken(res, csrfToken);

    // Return user data and CSRF token (token itself is in httpOnly cookie)
    return res.status(200).json({
      user: data.user,
      csrfToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

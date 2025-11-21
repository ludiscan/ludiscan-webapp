import type { NextApiRequest, NextApiResponse } from 'next';

import { setCsrfToken } from '@src/utils/security/cookies';
import { generateCsrfToken } from '@src/utils/security/csrf';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

/**
 * CSRF Token API Route
 *
 * Generates and returns a CSRF token for client-side requests.
 * The token is also set as a cookie for double-submit cookie pattern.
 *
 * Security: Rate limited to prevent token generation abuse
 */

interface CsrfResponse {
  csrfToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<CsrfResponse | { error: string }>) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimit = rateLimitMiddleware(RATE_LIMITS.READ_ONLY)(req, res);
  if (!rateLimit.allowed) return;

  try {
    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    // Set as cookie (not httpOnly so client can read it)
    setCsrfToken(res, csrfToken);

    // Also return in response body
    return res.status(200).json({ csrfToken });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] CSRF token generation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

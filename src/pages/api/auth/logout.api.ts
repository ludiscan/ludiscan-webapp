import type { NextApiRequest, NextApiResponse } from 'next';

import { clearAuthCookies } from '@src/utils/security/cookies';

/**
 * Logout API Route
 *
 * Clears all authentication cookies to log the user out.
 * This is a simple endpoint that removes httpOnly cookies from the client.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ success: boolean } | { error: string }>) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear all authentication cookies
    clearAuthCookies(res);

    return res.status(200).json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

import { env } from '@src/config/env';
import { setAuthToken, setCsrfToken } from '@src/utils/security/cookies';
import { generateCsrfToken } from '@src/utils/security/csrf';
import { rateLimitMiddleware, RATE_LIMITS } from '@src/utils/security/rateLimit';

interface SignupRequest {
  email: string;
  code: string;
  password: string;
}

interface SignupResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  csrfToken: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SignupResponse | { error: string }>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rateLimit = rateLimitMiddleware(RATE_LIMITS.AUTH)(req, res);
  if (!rateLimit.allowed) return;

  try {
    const { email, code, password } = req.body as SignupRequest;

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'Email, code, and password are required' });
    }

    const apiResponse = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0.1/auth/signup/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return res.status(apiResponse.status).json({
        error: (errorData as { message?: string }).message || 'Signup failed',
      });
    }

    const data = (await apiResponse.json()) as { token: string };

    if (!data.token) {
      return res.status(500).json({ error: 'Invalid response from authentication server' });
    }

    // トークンでユーザー情報を取得
    const profileResponse = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/login/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${data.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const userData = await profileResponse.json();

    if (!userData) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    const csrfToken = generateCsrfToken();
    setAuthToken(res, data.token);
    setCsrfToken(res, csrfToken);

    return res.status(200).json({ user: userData, csrfToken });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth] Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

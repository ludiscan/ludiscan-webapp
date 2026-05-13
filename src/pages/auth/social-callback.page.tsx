import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { checkSession } from '@src/slices/authSlice';

/**
 * Social Login Callback Page
 *
 * Handles OAuth callback from backend in two ways:
 *
 * Case 1: Backend redirects to /api/auth/social-callback?token=xxx (RECOMMENDED)
 *   - API route sets httpOnly cookie and redirects here without token
 *   - This page validates session using the cookie
 *
 * Case 2: Backend redirects to /auth/social-callback?token=xxx (LEGACY)
 *   - This page receives token in URL
 *   - Redirects to API route to set httpOnly cookie
 *   - API route redirects back here without token
 *   - This page validates session using the cookie
 *
 * Security: Token is removed from URL as soon as possible to prevent XSS
 */

export default function SocialCallback() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have a token in the URL (legacy backend behavior)
        const { token } = router.query;

        if (token && typeof token === 'string') {
          // Validate token format to prevent injection attacks
          if (!/^[A-Za-z0-9\-_.+~=/]+$/.test(token)) {
            setError('無効なトークン形式です。');
            setIsValidating(false);

            setTimeout(() => {
              router.replace('/login');
            }, 3000);
            return;
          }

          // Legacy flow: Backend redirected here with token in URL
          // Redirect to API route to set httpOnly cookie
          // eslint-disable-next-line no-console
          console.log('[Social Callback] Token in URL detected, redirecting to API route');

          // Redirect to API route which will set cookie and redirect back
          // Use URL object to construct a safe URL and prevent Open Redirect / Injection
          const targetUrl = new URL('/api/auth/social-callback', window.location.origin);
          targetUrl.searchParams.set('token', token);
          window.location.href = targetUrl.toString();
          return;
        }

        // No token in URL means cookie should already be set (new flow)
        // Validate session using httpOnly cookie
        // eslint-disable-next-line no-console
        console.log('[Social Callback] No token in URL, validating session with cookie');

        const resultAction = await dispatch(checkSession());

        if (checkSession.fulfilled.match(resultAction)) {
          // Session is valid, redirect to home
          setTimeout(() => {
            router.replace('/');
          }, 500);
        } else {
          // Session validation failed
          setError('認証に失敗しました。もう一度お試しください。');
          setIsValidating(false);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.replace('/login');
          }, 3000);
        }
      } catch {
        setError('予期しないエラーが発生しました。');
        setIsValidating(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    // Only run when router is ready
    if (router.isReady) {
      handleCallback();
    }
  }, [dispatch, router, router.isReady, router.query]);

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      {isValidating ? (
        <>
          <p>Signing you in…</p>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>しばらくお待ちください</p>
        </>
      ) : (
        <>
          <p style={{ color: 'red' }}>{error}</p>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>ログインページにリダイレクトします...</p>
        </>
      )}
    </div>
  );
}

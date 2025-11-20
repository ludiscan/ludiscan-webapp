import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useAppDispatch } from '@src/hooks/useDispatch';
import { checkSession } from '@src/slices/authSlice';

/**
 * Social Login Callback Success Page
 *
 * This page is shown after OAuth callback completes.
 * The authentication token has already been set as httpOnly cookie by the API route.
 *
 * Flow:
 * 1. User clicks "Login with Google" -> redirects to backend OAuth URL
 * 2. Backend handles OAuth and redirects to /api/auth/social-callback?token=xxx
 * 3. API route sets httpOnly cookie and redirects here
 * 4. This page validates the session and redirects to home
 *
 * Security: Token is never exposed to client JavaScript (XSS protection)
 */

export default function SocialCallback() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Validate session using httpOnly cookie
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

    validateSession();
  }, [dispatch, router]);

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

import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Button } from '@src/component/atoms/Button';
import { useLocale } from '@src/hooks/useLocale';

/**
 * Social Login Error Page
 *
 * Handles OAuth error redirects from the backend.
 * Query parameters:
 * - code: Error code (e.g., SIGNUP_DISABLED, INVALID_TOKEN, etc.)
 * - message: Optional human-readable error message
 */

type ErrorCode = 'SIGNUP_DISABLED' | 'INVALID_TOKEN' | 'PROVIDER_ERROR' | 'UNKNOWN';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  margin-bottom: 24px;
  font-size: 64px;
`;

const Title = styled.h1`
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const Message = styled.p`
  max-width: 400px;
  margin: 0 0 32px;
  font-size: 16px;
  line-height: 1.5;
  color: #666;
`;

const ErrorCodeText = styled.p`
  margin: 16px 0 0;
  font-size: 12px;
  color: #999;
`;

export default function SocialErrorPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [errorCode, setErrorCode] = useState<ErrorCode>('UNKNOWN');
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      const { code, message } = router.query;
      if (typeof code === 'string') {
        setErrorCode(code as ErrorCode);
      }
      if (typeof message === 'string') {
        setCustomMessage(message);
      }
    }
  }, [router.isReady, router.query]);

  const errorMessages: Record<ErrorCode, { title: string; message: string }> = {
    SIGNUP_DISABLED: {
      title: locale === 'ja' ? '新規登録が無効です' : 'Sign-up Disabled',
      message:
        locale === 'ja'
          ? '現在、新規ユーザー登録は受け付けておりません。既存のアカウントでログインしてください。'
          : 'New user registration is currently disabled. Please sign in with an existing account.',
    },
    INVALID_TOKEN: {
      title: locale === 'ja' ? '認証エラー' : 'Authentication Error',
      message:
        locale === 'ja'
          ? '認証トークンが無効または期限切れです。もう一度お試しください。'
          : 'The authentication token is invalid or expired. Please try again.',
    },
    PROVIDER_ERROR: {
      title: locale === 'ja' ? 'プロバイダーエラー' : 'Provider Error',
      message:
        locale === 'ja'
          ? '認証プロバイダーでエラーが発生しました。しばらくしてからもう一度お試しください。'
          : 'An error occurred with the authentication provider. Please try again later.',
    },
    UNKNOWN: {
      title: locale === 'ja' ? 'エラーが発生しました' : 'An Error Occurred',
      message: locale === 'ja' ? '認証中にエラーが発生しました。もう一度お試しください。' : 'An error occurred during authentication. Please try again.',
    },
  };

  const { title, message } = errorMessages[errorCode] || errorMessages.UNKNOWN;

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <Container>
      <ErrorIcon>&#x26A0;</ErrorIcon>
      <Title>{title}</Title>
      <Message>{customMessage || message}</Message>
      <Button onClick={handleBackToLogin} scheme='primary' fontSize='base'>
        {locale === 'ja' ? 'ログインページに戻る' : 'Back to Login'}
      </Button>
      {errorCode !== 'UNKNOWN' && <ErrorCodeText>Error Code: {errorCode}</ErrorCodeText>}
    </Container>
  );
}

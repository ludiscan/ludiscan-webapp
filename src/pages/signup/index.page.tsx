import styled from '@emotion/styled';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@src/store';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, FlexRow, InlineFlexColumn } from '@src/component/atoms/Flex';
import { Seo } from '@src/component/atoms/Seo';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { LanguageSelector } from '@src/component/molecules/LanguageSelector';
import { LinedText } from '@src/component/molecules/LinedText';
import { TextField } from '@src/component/molecules/TextField';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { useToast } from '@src/component/templates/ToastContext';
import { env } from '@src/config/env';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';
import { checkSession } from '@src/slices/authSlice';
import { saveUser } from '@src/utils/localstrage';

type Step = 'email' | 'code';

export type SignupPageProps = {
  className?: string | undefined;
};

const Content: FC<SignupPageProps> = ({ className }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const isDesktop = useIsDesktop();
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = useCallback(async () => {
    if (!email) {
      showToast(t('signup.emailStep.errorRequired'), 2, 'error');
      return;
    }
    setIsLoading(true);
    try {
      const { error, response } = await createClient().POST('/api/v0.1/auth/signup/request', {
        body: { email },
      });
      if (response.status === 403) {
        showToast(t('signup.disabled'), 3, 'error');
        return;
      }
      if (response.status === 409) {
        showToast(t('signup.emailStep.alreadyRegistered'), 3, 'error');
        return;
      }
      if (error) {
        showToast(t('signup.emailStep.errorGeneric'), 3, 'error');
        return;
      }
      showToast(t('signup.emailStep.sent'), 3, 'success');
      setStep('code');
    } catch {
      showToast(t('signup.emailStep.errorGeneric'), 3, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [email, showToast, t]);

  const handleComplete = useCallback(async () => {
    if (!code || !password || !confirmPassword) {
      showToast(t('signup.codeStep.errorRequired'), 2, 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast(t('signup.codeStep.errorMismatch'), 2, 'error');
      return;
    }
    if (password.length < 8) {
      showToast(t('signup.codeStep.errorTooShort'), 2, 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code, password }),
      });
      if (res.status === 403) {
        showToast(t('signup.disabled'), 3, 'error');
        return;
      }
      if (res.status === 400) {
        showToast(t('signup.codeStep.errorInvalidCode'), 3, 'error');
        return;
      }
      if (res.status === 409) {
        showToast(t('signup.emailStep.alreadyRegistered'), 3, 'error');
        setStep('email');
        return;
      }
      if (!res.ok) {
        showToast(t('signup.codeStep.errorGeneric'), 3, 'error');
        return;
      }
      const data = await res.json();
      if (data.user) {
        saveUser(data.user);
      }
      await dispatch(checkSession());
      showToast(t('signup.success'), 2, 'success');
      router.replace('/home');
    } catch {
      showToast(t('signup.codeStep.errorGeneric'), 3, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [code, confirmPassword, dispatch, email, password, router, showToast, t]);

  return (
    <div className={className}>
      <DashboardBackgroundCanvas />
      <InnerContent showSidebar={false}>
        <Header title={''} showSidebar={false} />
        <Card
          color={isDesktop ? theme.colors.surface.base : 'unset'}
          border={theme.colors.border.default}
          shadow={'medium'}
          padding={'32px 28px'}
          className={`${className}__form`}
        >
          <InlineFlexColumn gap={24} className={`${className}__content`} align={'center'}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <LanguageSelector />
            </div>
            <InlineFlexColumn style={{ width: '100%' }} gap={8} align={'flex-start'}>
              <Text text={step === 'email' ? t('signup.title') : t('signup.codeStep.title')} fontWeight={'bold'} fontSize={theme.typography.fontSize['3xl']} />
              <Text text={step === 'email' ? t('signup.description') : email} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </InlineFlexColumn>

            {step === 'email' && (
              <>
                <a
                  className={`${className}__button google-signup`}
                  href={`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/auth/google/signup`}
                  target={'_self'}
                  rel={'noopener noreferrer'}
                >
                  <Image src={'/google.svg'} alt={'google'} width={20} height={20} />
                  <Text
                    className={`${className}__buttonText`}
                    text={t('signup.signUpWithGoogle')}
                    color={theme.colors.text.primary}
                    fontSize={theme.typography.fontSize.base}
                    fontWeight={'bolder'}
                  />
                </a>
                <LinedText
                  color={theme.colors.text.primary}
                  lineColor={theme.colors.secondary.light}
                  text={t('common.or')}
                  lineThickness={'1px'}
                  fullWidth={true}
                />
                <FlexColumn gap={2} className={`${className}__email`}>
                  <Text text={t('common.email')} fontSize={theme.typography.fontSize.sm} />
                  <TextField
                    onChange={setEmail}
                    value={email}
                    id={'signup-email'}
                    placeholder={t('login.emailPlaceholder')}
                    type={'email'}
                    fontSize={theme.typography.fontSize.base}
                    style={{ width: '100%' }}
                  />
                </FlexColumn>
                <VerticalSpacer size={2} />
                <Button onClick={handleSendCode} scheme={'primary'} radius={'default'} fontSize={'lg'} width={'full'} disabled={!email || isLoading}>
                  <Text text={isLoading ? t('signup.emailStep.sending') : t('signup.emailStep.submit')} />
                </Button>
              </>
            )}

            {step === 'code' && (
              <>
                <FlexColumn gap={2} className={`${className}__field`}>
                  <Text text={t('signup.codeStep.codeLabel')} fontSize={theme.typography.fontSize.sm} />
                  <TextField
                    onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                    value={code}
                    id={'signup-code'}
                    placeholder={t('signup.codeStep.codePlaceholder')}
                    type={'number'}
                    fontSize={theme.typography.fontSize.base}
                    style={{ width: '100%' }}
                  />
                </FlexColumn>
                <FlexColumn gap={2} className={`${className}__field`}>
                  <Text text={t('signup.codeStep.passwordLabel')} fontSize={theme.typography.fontSize.sm} />
                  <TextField
                    onChange={setPassword}
                    value={password}
                    id={'signup-password'}
                    placeholder={t('signup.codeStep.passwordPlaceholder')}
                    type={'password'}
                    fontSize={theme.typography.fontSize.base}
                    style={{ width: '100%' }}
                  />
                </FlexColumn>
                <FlexColumn gap={2} className={`${className}__field`}>
                  <Text text={t('signup.codeStep.confirmPasswordLabel')} fontSize={theme.typography.fontSize.sm} />
                  <TextField
                    onChange={setConfirmPassword}
                    value={confirmPassword}
                    id={'signup-confirm-password'}
                    placeholder={t('signup.codeStep.confirmPasswordPlaceholder')}
                    type={'password'}
                    fontSize={theme.typography.fontSize.base}
                    style={{ width: '100%' }}
                  />
                </FlexColumn>
                <VerticalSpacer size={2} />
                <Button
                  onClick={handleComplete}
                  scheme={'primary'}
                  radius={'default'}
                  fontSize={'lg'}
                  width={'full'}
                  disabled={!code || !password || !confirmPassword || isLoading}
                >
                  <Text text={isLoading ? t('signup.codeStep.submitting') : t('signup.codeStep.submit')} />
                </Button>
                <button className={`${className}__textButton`} onClick={() => setStep('email')}>
                  <Text
                    text={'← ' + t('login.emailPlaceholder').replace('example@email.com', email || 'email')}
                    fontSize={theme.typography.fontSize.sm}
                    color={theme.colors.text.secondary}
                  />
                </button>
              </>
            )}

            <FlexRow gap={4} align={'center'}>
              <Link href='/login' className={`${className}__backToLogin`}>
                {t('signup.backToLogin')}
              </Link>
            </FlexRow>
          </InlineFlexColumn>
        </Card>
      </InnerContent>
    </div>
  );
};

const Component: FC<SignupPageProps> = (props) => {
  return (
    <div className={props.className}>
      <Seo title='Sign up' path='/signup' keywords={['signup', 'register', 'create account']} />
      <Content {...props} />
    </div>
  );
};

const hexToRgba = (hex: string, alpha: number) => {
  let c = hex.replace('#', '');
  if (c.length === 3)
    c = c
      .split('')
      .map((ch) => ch + ch)
      .join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const IndexPage = styled(Component)`
  position: relative;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.primary};
  background: #ffeaea;

  &__form {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 500px;
    margin: 20px;
  }

  .mobile &__form {
    max-width: 100%;
    height: 100%;
    max-height: unset;
    margin: 0;
    background: ${({ theme }) => hexToRgba(theme.colors.surface.base, 0.5)};
    border: none;
  }

  &__content {
    width: 100%;
  }

  &__email,
  &__field {
    width: calc(100% - 48px);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__button {
    display: flex;
    flex-direction: row;
    gap: 2px;
    align-content: center;
    align-items: center;
    min-height: 24px;
    padding: 12px 24px;
    text-decoration: none;
    background: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.strong};
    border-radius: 48px;
  }

  &__button:hover {
    opacity: 0.6;
  }

  &__button.google-signup {
    width: calc(100% - 48px);
    max-width: 320px;
  }

  &__buttonText {
    width: 100%;
    text-align: center;
  }

  &__backToLogin {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }

  &__textButton {
    padding: 0;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      opacity: 0.7;
    }
  }
`;

export default function SignupPage(props: SignupPageProps) {
  return <IndexPage {...props} />;
}

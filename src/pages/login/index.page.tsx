import styled from '@emotion/styled';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, InlineFlexColumn } from '@src/component/atoms/Flex';
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
import { useAuth } from '@src/hooks/useAuth';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { InnerContent } from '@src/pages/_app.page';

export type LoginPageProps = {
  className?: string | undefined;
};

const Content: FC<LoginPageProps> = ({ className }) => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showToast } = useToast();
  const onClose = useCallback(() => {
    router.back();
  }, [router]);
  const handleInputEmail = useCallback((e: string) => {
    setEmail(e);
  }, []);
  const handleInputPassword = useCallback((e: string) => {
    setPassword(e);
  }, []);

  const { isLoading, login } = useAuth({
    onSuccessLogin: () => {
      showToast(t('login.success'), 1, 'success');
      onClose();
    },
  });
  const handleLogin = useCallback(async () => {
    if (email === '' || password === '') {
      showToast(t('login.errorEmptyFields'), 1, 'error');
      return;
    }
    if (!isLoading) {
      await login({ email, password });
    }
  }, [email, isLoading, login, password, showToast, t]);

  const loginDisabled = useMemo(() => email === '' || password === '' || isLoading, [email, password, isLoading]);
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
              <Text text={t('login.title')} fontWeight={'bold'} fontSize={theme.typography.fontSize['3xl']} />
              <Text text={t('login.description')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </InlineFlexColumn>
            <a
              className={`${className}__button google-login`}
              href={`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/auth/google`}
              target={'_self'}
              rel={'noopener noreferrer'}
            >
              <Image src={'/google.svg'} alt={'google'} width={20} height={20} />
              <Text
                className={`${className}__buttonText`}
                text={t('login.continueWithGoogle')}
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
                onChange={handleInputEmail}
                value={email}
                id={t('common.email')}
                placeholder={t('login.emailPlaceholder')}
                type={'email'}
                fontSize={theme.typography.fontSize.base}
                style={{ width: '100%' }}
              />
            </FlexColumn>
            <FlexColumn gap={2} className={`${className}__password`}>
              <Text text={t('common.password')} fontSize={theme.typography.fontSize.sm} />
              <TextField
                onChange={handleInputPassword}
                value={password}
                id={t('common.password')}
                type={'password'}
                placeholder={t('login.passwordPlaceholder')}
                fontSize={theme.typography.fontSize.base}
                style={{ width: '100%' }}
              />
            </FlexColumn>

            <VerticalSpacer size={2} />
            <Button onClick={handleLogin} scheme={'primary'} radius={'default'} fontSize={'lg'} width={'full'} disabled={loginDisabled}>
              <Text text={t('login.signIn')} />
            </Button>
          </InlineFlexColumn>
        </Card>
      </InnerContent>
    </div>
  );
};

const Component: FC<LoginPageProps> = (props) => {
  return (
    <div className={props.className}>
      <Seo title='Login' path='/login' keywords={['login', 'sign in', 'authentication']} />
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

  &__container {
    height: 100%;
  }

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
  &__password {
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

  &__button.google-login {
    width: calc(100% - 48px);
    max-width: 320px;
  }

  &__buttonText {
    width: 100%;
    text-align: center;
  }
`;

export default function Index(props: LoginPageProps) {
  return <IndexPage {...props} />;
}

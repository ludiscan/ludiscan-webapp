import styled from '@emotion/styled';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { FlexColumn, InlineFlexColumn } from '@src/component/atoms/Flex';
import { Seo } from '@src/component/atoms/Seo';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { LanguageSelector } from '@src/component/molecules/LanguageSelector';
import { TextField } from '@src/component/molecules/TextField';
import { DashboardBackgroundCanvas } from '@src/component/templates/DashboardBackgroundCanvas';
import { Header } from '@src/component/templates/Header';
import { useToast } from '@src/component/templates/ToastContext';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';

export type PasswordResetRequestPageProps = {
  className?: string | undefined;
};

const Content: FC<PasswordResetRequestPageProps> = ({ className }) => {
  const isDesktop = useIsDesktop();
  const { theme } = useSharedTheme();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await createClient().POST('/api/v0.1/auth/password-reset/request', {
        body: { email },
      });
      if (error) {
        throw new Error(t('passwordReset.request.errorGeneric'));
      }
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: Error) => {
      showToast(error.message, 3, 'error');
    },
  });

  const handleSubmit = useCallback(() => {
    if (!email) {
      showToast(t('passwordReset.request.errorRequired'), 2, 'error');
      return;
    }
    mutate();
  }, [email, mutate, showToast, t]);

  const disabled = !email || isPending || submitted;

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
              <Text text={t('passwordReset.request.title')} fontWeight={'bold'} fontSize={theme.typography.fontSize['3xl']} />
              <Text text={t('passwordReset.request.description')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            </InlineFlexColumn>

            {submitted ? (
              <Text text={t('passwordReset.request.sent')} fontSize={theme.typography.fontSize.base} color={theme.colors.text.primary} />
            ) : (
              <FlexColumn gap={2} className={`${className}__email`}>
                <Text text={t('common.email')} fontSize={theme.typography.fontSize.sm} />
                <TextField
                  onChange={setEmail}
                  value={email}
                  id={'reset-email'}
                  placeholder={t('login.emailPlaceholder')}
                  type={'email'}
                  fontSize={theme.typography.fontSize.base}
                  style={{ width: '100%' }}
                />
              </FlexColumn>
            )}

            <VerticalSpacer size={2} />
            {!submitted && (
              <Button onClick={handleSubmit} scheme={'primary'} radius={'default'} fontSize={'lg'} width={'full'} disabled={disabled}>
                <Text text={isPending ? t('passwordReset.request.sending') : t('passwordReset.request.submit')} />
              </Button>
            )}
            <Link href='/login?returnTo=/' className={`${className}__back`}>
              {t('passwordReset.request.backToLogin')}
            </Link>
          </InlineFlexColumn>
        </Card>
      </InnerContent>
    </div>
  );
};

const Component: FC<PasswordResetRequestPageProps> = (props) => {
  return (
    <div className={props.className}>
      <Seo title='Reset Password' path='/password-reset/request' noIndex={true} />
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

const PasswordResetRequestPage = styled(Component)`
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

  &__email {
    width: calc(100% - 48px);
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__back {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`;

export default function PasswordResetRequestIndex(props: PasswordResetRequestPageProps) {
  return <PasswordResetRequestPage {...props} />;
}

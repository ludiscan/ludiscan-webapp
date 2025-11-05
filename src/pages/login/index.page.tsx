import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Card } from '@src/component/atoms/Card';
import { InlineFlexColumn } from '@src/component/atoms/Flex';
import { VerticalSpacer } from '@src/component/atoms/Spacer';
import { Text } from '@src/component/atoms/Text';
import { LinedText } from '@src/component/molecules/LinedText';
import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';
import { Header } from '@src/component/templates/Header';
import { useToast } from '@src/component/templates/ToastContext';
import { env } from '@src/config/env';
import { useAuth } from '@src/hooks/useAuth';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes } from '@src/styles/style';

export type LoginPageProps = {
  className?: string | undefined;
};

const slideX = keyframes`
  0% {
    /* 6レイヤー分の position を横方向に大きく変化させる */
    background-position:
      20% 60%, /* linear帯 */
      8%  64%,
      92% 58%,
      46% 66%,
      24% 58%,
      76% 58%;
  }
  50% {
    background-position:
      62% 62%,
      14% 60%,
      86% 62%,
      54% 64%,
      30% 56%,
      70% 60%;
  }
  100% {
    background-position:
      55% 60%,
      10% 58%,
      90% 60%,
      50% 66%,
      28% 60%,
      72% 58%;
  }
`;

const ripple = keyframes`
  0% {
    background-size:
      260% 160%, 200% 110%, 200% 110%, 220% 130%, 200% 110%, 200% 110%;
  }
  50% {
    background-size:
      260% 170%, 210% 130%, 210% 120%, 230% 150%, 210% 130%, 210% 120%;
  }
  100% {
    background-size:
      260% 160%, 200% 110%, 200% 110%, 220% 130%, 200% 110%, 200% 110%;
  }
`;

const slowSpin = keyframes`to { transform: rotate(13deg) scale(1.04); }`;

const SVGFilterDefs: FC = () => (
  <svg width='0' height='0' style={{ position: 'absolute' }} aria-hidden>
    <filter id='warp'>
      <feTurbulence type='fractalNoise' baseFrequency='0.003 0.002' numOctaves='2' seed='7'>
        <animate attributeName='baseFrequency' dur='16s' values='0.003 0.002;0.002 0.003;0.003 0.002' repeatCount='indefinite' />
      </feTurbulence>
      {/* scale を 16–36 で調整：大きいほど“うねる” */}
      <feDisplacementMap in='SourceGraphic' scale='24' />
    </filter>
  </svg>
);
const background = `
  linear-gradient(200deg, #3dffe2 10%, #3dffef 40%, #a4e6ff 70%, #36ff9b 100%),
  radial-gradient(140% 60% at 20% 58%, rgba(237, 61, 108, 0.85) 0 32%, transparent 20%),
  radial-gradient(140% 58% at 80% 62%, rgba(92, 255, 130, 0.85) 0 34%, transparent 64%),
  radial-gradient(180% 70% at 50% 66%, rgba(61, 197, 255, 0.9) 0 22%, transparent 20%),
  radial-gradient(140% 60% at 35% 50%, rgba(255, 138, 61, 0.8) 0 26%, transparent 30%),
  radial-gradient(140% 60% at 65% 52%, rgba(54, 163, 255, 0.85) 0 26%, transparent 60%)
`;

/** 横に伸びる JetBrains 風レイヤ */
const WavyLayer = styled.div`
  position: fixed;
  inset: 25% -20% 30%;
  z-index: 0;
  pointer-events: none;

  /* 1) 長い帯（linear） + 2) 横長の楕円を重ねる */
  background: ${background};
  background-repeat: no-repeat;

  /* 初期位置（中腹に集中させる） */
  background-position:
    50% 62%,
    12% 64%,
    88% 60%,
    50% 66%,
    32% 58%,
    68% 58%;

  /* 横方向に“帯”が伸びるように各レイヤのサイズを大きくする */
  background-size:
    260% 160%,
    /* linear 帯は特にワイド */ 200% 120%,
    200% 120%,
    220% 140%,
    200% 120%,
    200% 120%;
  background-blend-mode: screen, normal, normal, normal, normal, normal;

  /* ← ここが “うねり”の肝。SVG 変形 + ブラー */
  filter: url('#warp') blur(30px) saturate(1.15);
  transform-origin: 50% 62%;

  /* 回転は今の slowSpin を維持し、ripple を追加 */
  animation:
    ${slideX} 12s ease-in-out infinite alternate,
    ${ripple} 4s ease-in-out infinite alternate,
    ${slowSpin} 6s linear infinite alternate;
  will-change: transform, background-position, background-size, filter;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Content: FC<LoginPageProps> = ({ className }) => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const { theme } = useSharedTheme();
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
      showToast('Login success', 1, 'success');
      onClose();
    },
  });
  const handleLogin = useCallback(async () => {
    if (email === '' || password === '') {
      showToast('Please enter email and password', 1, 'error');
      return;
    }
    if (!isLoading) {
      await login({ email, password });
    }
  }, [email, isLoading, login, password, showToast]);

  const loginDisabled = useMemo(() => email === '' || password === '' || isLoading, [email, password, isLoading]);
  return (
    <div className={className}>
      <SVGFilterDefs />
      <WavyLayer />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 1, height: '100%' }}>
        <Header title={''} />
        <Card
          color={isDesktop ? theme.colors.surface.base : 'unset'}
          border={theme.colors.border.default}
          shadow={'medium'}
          padding={'32px 28px'}
          className={`${className}__form`}
        >
          <InlineFlexColumn gap={24} className={`${className}__content`} align={'center'}>
            <InlineFlexColumn style={{ width: '100%' }} gap={8} align={'flex-start'}>
              <Text text={'Ludiscan Account'} fontWeight={'bold'} fontSize={fontSizes.largest} />
              <Text text={'sign in to manage all Ludiscan services and heatmap tools.'} fontSize={fontSizes.medium} color={theme.colors.text.primary} />
            </InlineFlexColumn>
            <a className={`${className}__button google-login`} href={`${env.API_BASE_URL}/api/v0/auth/google`} target={'_self'} rel={'noopener noreferrer'}>
              <Image src={'/google.svg'} alt={'google'} width={20} height={20} />
              <Text
                className={`${className}__buttonText`}
                text={'Continue with Google'}
                color={theme.colors.text.primary}
                fontSize={fontSizes.medium}
                fontWeight={'bolder'}
              />
            </a>
            <LinedText color={theme.colors.text.primary} lineColor={theme.colors.secondary.light} text={'or'} lineThickness={'1px'} fullWidth={true} />
            <OutlinedTextField
              className={`${className}__email`}
              onChange={handleInputEmail}
              value={email}
              label={'Email'}
              placeholder={'example@email.com'}
              type={'email'}
              fontSize={fontSizes.medium}
              maxLength={50}
            />
            <OutlinedTextField
              className={`${className}__password`}
              onChange={handleInputPassword}
              value={password}
              label={'Password'}
              type={'password'}
              placeholder={'password'}
              fontSize={fontSizes.medium}
              maxLength={20}
            />
            <VerticalSpacer size={2} />
            <Button onClick={handleLogin} scheme={'primary'} radius={'default'} fontSize={'lg'} width={'full'} disabled={loginDisabled}>
              <Text text={'Sign in'} />
            </Button>
          </InlineFlexColumn>
        </Card>
      </div>
    </div>
  );
};

const Component: FC<LoginPageProps> = (props) => {
  return (
    <div className={props.className}>
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
    max-width: 320px;
    max-height: 600px;
    margin: 20px;
  }

  .mobile &__form {
    max-width: calc(100% - 58px);
    height: 100%;
    max-height: unset;
    margin: 0;
    background: ${({ theme }) => hexToRgba(theme.colors.surface.base, 0.5)};
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
    height: 24px;
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

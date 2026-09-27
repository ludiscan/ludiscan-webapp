import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { FC } from 'react';

import { JsonLd, LudiscanOrganization, LudiscanWebSite } from '@src/component/atoms/JsonLd';
import { Seo } from '@src/component/atoms/Seo';
import { CTASection } from '@src/component/organisms/landing/CTASection';
import { Footer } from '@src/component/organisms/landing/Footer';
import { HeroSection } from '@src/component/organisms/landing/HeroSection';
import { ProductVisualization } from '@src/component/organisms/landing/ProductVisualization';
import { TrustSection } from '@src/component/organisms/landing/TrustSection';
import { useAuth } from '@src/hooks/useAuth';

// three / r3f を LP の初期 JS から外し、hydration 後に別 chunk で読む
const HeatmapBackgroundDemo = dynamic(() => import('@src/component/organisms/landing/HeatmapBackgroundDemo').then((mod) => mod.HeatmapBackgroundDemo), {
  ssr: false,
});

export type IndexPageProps = {
  className?: string;
};

const Component: FC<IndexPageProps> = ({ className }) => {
  const router = useRouter();
  const { isAuthorized, ready } = useAuth();
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (ready && isAuthorized) {
      router.replace('/home');
    }
  }, [isAuthorized, ready, router]);

  // 動きを減らす設定のユーザーには常時アニメーションする背景ごと読み込まない
  useEffect(() => {
    setShowBackground(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // セッション確認の API 応答を待たずに LP を出す（SSR にも LP が載る）。
  // localStorage からログイン済みと分かる場合だけ、LP のチラつきを避けてローディングを出す
  if (isAuthorized) {
    return (
      <div className={`${className}__loading`}>
        <div className={`${className}__loading-content`}>
          <div className={`${className}__loading-logo`}>L</div>
          <div className={`${className}__loading-bar`}>
            <div className={`${className}__loading-progress`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Seo path='/' />
      <JsonLd schema={LudiscanOrganization} />
      <JsonLd schema={LudiscanWebSite} />

      {/* Three.js animated background */}
      {showBackground && <HeatmapBackgroundDemo />}

      {/* Main content */}
      <div className={`${className}__content`}>
        <HeroSection />
        <TrustSection />
        <ProductVisualization />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
};

const loadingPulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const loadingProgress = keyframes`
  0% {
    width: 0%;
    left: 0;
  }
  50% {
    width: 100%;
    left: 0;
  }
  100% {
    width: 0%;
    left: 100%;
  }
`;

const IndexPage = styled(Component)`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  background: ${({ theme }) => theme.colors.background.default};

  /* Smooth scrolling */
  scroll-behavior: smooth;

  &__content {
    position: relative;
    z-index: 1;
    height: 100vh;
    height: 100dvh;
    overflow: hidden auto;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    background: ${({ theme }) => theme.colors.background.default};
  }

  &__loading-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }

  &__loading-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    font-size: 1.75rem;
    font-weight: 800;
    color: #030303;
    background: linear-gradient(135deg, #00f5ff 0%, #00d4e0 100%);
    border-radius: 16px;
    animation: ${loadingPulse} 2s ease-in-out infinite;
  }

  &__loading-bar {
    position: relative;
    width: 120px;
    height: 3px;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.border.subtle};
    border-radius: 2px;
  }

  &__loading-progress {
    position: absolute;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #00f5ff, #a890d3);
    border-radius: 2px;
    animation: ${loadingProgress} 1.5s ease-in-out infinite;
  }

  /* Selection styling */
  ::selection {
    color: ${({ theme }) => theme.colors.text.primary};
    background: #00f5ff40;
  }
`;

export default function App(props: IndexPageProps) {
  return <IndexPage {...props} />;
}

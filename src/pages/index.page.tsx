import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import type { FC } from 'react';

import { CTASection } from '@src/component/organisms/landing/CTASection';
import { Footer } from '@src/component/organisms/landing/Footer';
import { HeatmapBackgroundDemo } from '@src/component/organisms/landing/HeatmapBackgroundDemo';
import { HeroSection } from '@src/component/organisms/landing/HeroSection';
import { ProductVisualization } from '@src/component/organisms/landing/ProductVisualization';
import { TrustSection } from '@src/component/organisms/landing/TrustSection';
import { useAuth } from '@src/hooks/useAuth';

export type IndexPageProps = {
  className?: string;
};

const Component: FC<IndexPageProps> = ({ className }) => {
  const router = useRouter();
  const { isAuthorized, ready } = useAuth();

  useEffect(() => {
    // When user is authorized, redirect to home
    if (ready && isAuthorized) {
      router.push('/home');
    }
  }, [isAuthorized, ready, router]);

  // Show loading state while checking auth
  if (!ready) {
    return (
      <div className={`${className}__loading`}>
        <div className={`${className}__loading-spinner`} />
      </div>
    );
  }

  // Don't render landing page for authorized users (they'll be redirected)
  if (isAuthorized) {
    return null;
  }

  return (
    <div className={className}>
      {/* Three.js animated background */}
      <Suspense fallback={null}>
        <HeatmapBackgroundDemo />
      </Suspense>

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

const IndexPage = styled(Component)`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: ${({ theme }) => theme.colors.background.default};

  /* Smooth scrolling */
  scroll-behavior: smooth;

  &__content {
    position: relative;
    z-index: 1;
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background.default};
  }

  &__loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid ${({ theme }) => theme.colors.border.default};
    border-top-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Selection styling */
  ::selection {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.primary.main}44;
  }
`;

export default function App(props: IndexPageProps) {
  return <IndexPage {...props} />;
}

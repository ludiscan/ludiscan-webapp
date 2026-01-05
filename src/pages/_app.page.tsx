import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { GoogleTagManager } from '@next/third-parties/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import { Provider } from 'react-redux';

import type { AppStore } from '@src/store';
import type { AppProps } from 'next/app';

import '@src/styles/globals.css';

import { ToastProvider } from '@src/component/templates/ToastContext';
import { env } from '@src/config/env';
import { LocaleProvider } from '@src/contexts/LocaleContext';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import { store } from '@src/store';
import { dimensions, zIndexes } from '@src/styles/style';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Content = styled.div`
  overflow: hidden auto;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
`;

const LoadingOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${zIndexes.pageLoading};
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: ${({ theme }) => theme.colors.background.default}e6;
  animation: ${fadeIn} 0.2s ease-out;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid ${({ theme }) => theme.colors.border.default};
  border-top-color: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const InnerContent = styled.div<{ showSidebar?: boolean }>`
  position: relative;

  /* Add padding for fixed header */
  padding-top: ${dimensions.headerHeight + 16}px;

  /* Use logical property for RTL/LTR support (Design Implementation Guide Rule 4) */
  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    margin-inline-start: ${(props) => (props.showSidebar !== false ? dimensions.sidebarWidth : 0)}px;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  const isDesktop = useIsDesktop();
  const [isPageLoading, setIsPageLoading] = useState(false);
  ReactModal.setAppElement('#__next');
  const queryClient = useMemo(() => new QueryClient(), []);
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = store();
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleStart = () => {
      // 200ms以上かかる遷移のみローディングを表示（チラつき防止）
      timeout = setTimeout(() => setIsPageLoading(true), 200);
    };
    const handleComplete = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      setIsPageLoading(false);
    };

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleComplete);
    Router.events.on('routeChangeError', handleComplete);

    return () => {
      if (timeout) clearTimeout(timeout);
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, []);

  return (
    <>
      <Provider store={storeRef.current}>
        <LocaleProvider>
          <QueryClientProvider client={queryClient}>
            <SharedThemeProvider>
              {isPageLoading && (
                <LoadingOverlay>
                  <LoadingSpinner />
                  <LoadingText>Loading...</LoadingText>
                </LoadingOverlay>
              )}
              <ToastProvider position={'top-right'}>
                <Content
                  id='app-scroll-container'
                  className={isDesktop === undefined ? '' : isDesktop ? 'desktop' : 'mobile'}
                  style={{ height: '100vh' }}
                  data-testid={'app-content'}
                >
                  <Component {...pageProps} />
                </Content>
              </ToastProvider>
            </SharedThemeProvider>
          </QueryClientProvider>
        </LocaleProvider>
      </Provider>
      <GoogleTagManager gtmId={env.NEXT_PUBLIC_GTM_ID} />
    </>
  );
}

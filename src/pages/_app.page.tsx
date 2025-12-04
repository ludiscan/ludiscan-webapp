import styled from '@emotion/styled';
import { GoogleTagManager } from '@next/third-parties/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
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
import { dimensions } from '@src/styles/style';

const Content = styled.div`
  overflow: hidden auto;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
`;

export const InnerContent = styled.div<{ showSidebar?: boolean }>`
  position: relative;

  /* Add padding for fixed header */
  padding-top: ${dimensions.headerHeight}px;

  /* Use logical property for RTL/LTR support (Design Implementation Guide Rule 4) */
  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    margin-inline-start: ${(props) => (props.showSidebar !== false ? dimensions.sidebarWidth : 0)}px;
  }
`;

export default function App({ Component, pageProps }: AppProps) {
  const isDesktop = useIsDesktop();
  ReactModal.setAppElement('#__next');
  const queryClient = useMemo(() => new QueryClient(), []);
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = store();
  }

  return (
    <>
      <Provider store={storeRef.current}>
        <LocaleProvider>
          <QueryClientProvider client={queryClient}>
            <SharedThemeProvider>
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

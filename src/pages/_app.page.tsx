import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useRef } from 'react';
import ReactModal from 'react-modal';
import { Provider } from 'react-redux';

import type { AppStore } from '@src/store';
import type { AppProps } from 'next/app';

import { ToastProvider } from '@src/component/templates/ToastContext';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import { store } from '@src/store';
import { dimensions } from '@src/styles/style';

const Content = styled.div`
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
`;

export const InnerContent = styled.div`
  /* stylelint-disable-next-line */
  @media (min-width: ${dimensions.mobileWidth}px) {
    margin-left: ${dimensions.sidebarWidth}px;
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
    <Provider store={storeRef.current}>
      <ToastProvider position={'top-right'}>
        <QueryClientProvider client={queryClient}>
          <SharedThemeProvider>
            <Content className={isDesktop === undefined ? '' : isDesktop ? 'desktop' : 'mobile'} style={{ height: '100vh' }} data-testid={'app-content'}>
              <Component {...pageProps} />
            </Content>
          </SharedThemeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </Provider>
  );
}

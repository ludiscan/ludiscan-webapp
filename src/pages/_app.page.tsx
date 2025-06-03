import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import ReactModal from 'react-modal';
import { Provider } from 'react-redux';

import type { AppProps } from 'next/app';

import { ToastProvider } from '@src/component/templates/ToastContext';
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
  ReactModal.setAppElement('#__next');
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <Provider store={store}>
      <ToastProvider position={'top-right'}>
        <QueryClientProvider client={queryClient}>
          <SharedThemeProvider>
            <Content>
              <Component {...pageProps} />
            </Content>
          </SharedThemeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </Provider>
  );
}

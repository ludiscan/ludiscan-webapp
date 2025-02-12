import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import ReactModal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';

import { SharedThemeProvider } from './hooks/useSharedTheme.tsx';
import { Pages } from './pages/Pages.tsx';

import { Header } from '@/component/templates/Header.tsx';
import { SidebarLayout } from '@/component/templates/SidebarLayout.tsx';
import { ToastProvider } from '@/component/templates/ToastContext.tsx';

const Content = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
`;

function App() {
  ReactModal.setAppElement('#root');
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToastProvider position={'top-right'}>
          <SharedThemeProvider>
            <Content>
              <SidebarLayout />
              <Header />
              <Pages />
            </Content>
          </SharedThemeProvider>
        </ToastProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

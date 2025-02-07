import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import ReactModal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';

import { SharedThemeProvider } from './hooks/useSharedTheme.tsx';
import { Pages } from './pages/Pages.tsx';

const Content = styled.div`
  width: 100vw;
  height: 100vh;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
`;

function App() {
  ReactModal.setAppElement('#root');
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SharedThemeProvider>
          <Content>
            <Pages />
          </Content>
        </SharedThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

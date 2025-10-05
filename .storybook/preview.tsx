import type { Preview } from '@storybook/nextjs';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';
import { store } from '@src/store';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  argTypes: {
    type: {
      control: {
        type: 'select',
        labels: { light: 'lightTheme', dark: 'darkTheme' },
      },
      options: ['light', 'dark'],
    },
  },
  args: {
    type: 'light',
  },
  decorators: [
    (Story, context) => {
      // context.args.type からテーマを選択
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
          },
        },
      });
      const theme = context.args.type === 'light' ? lightTheme : darkTheme;
      return (
        <QueryClientProvider client={queryClient}>
          <Provider store={store()}>
            <SharedThemeProvider initialTheme={theme}>
              <Story />
            </SharedThemeProvider>
          </Provider>
        </QueryClientProvider>
      );
    },
  ],
};
export default preview;

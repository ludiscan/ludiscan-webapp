import type { Preview } from '@storybook/nextjs';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import { store } from '@src/store';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import themes from '@src/modeles/theme';
import { LocaleProvider } from '@src/contexts/LocaleContext';

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
      const theme = context.args.type === 'light' ? themes.crimsonDusk.light : themes.crimsonDusk.dark;
      return (
        <QueryClientProvider client={queryClient}>
          <Provider store={store()}>
            <LocaleProvider>
              <SharedThemeProvider initialTheme={theme}>
                <Story />
              </SharedThemeProvider>
            </LocaleProvider>
          </Provider>
        </QueryClientProvider>
      );
    },
  ],
};
export default preview;

import type { Preview } from '@storybook/react';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';
import { store } from '@src/store';
import { Provider } from 'react-redux';

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
      const theme = context.args.type === 'light' ? lightTheme : darkTheme;
      return (
        <Provider store={store}>
          <SharedThemeProvider initialTheme={theme}>
            <Story />
          </SharedThemeProvider>
        </Provider>
      );
    },
  ],
};
export default preview;

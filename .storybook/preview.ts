import type { Preview } from '@storybook/react';


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
  }
};
export default preview;

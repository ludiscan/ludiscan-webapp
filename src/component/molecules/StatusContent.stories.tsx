import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

export default {
  component: StatusContent,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof StatusContent>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <StatusContent {...args}>
          <Text text={'hello'} />
        </StatusContent>
      </SharedThemeProvider>
    );
  },
};

export const Loading: Story = {
  ...Template,
  name: 'Loading',
  args: {
    status: 'loading',
  },
};

export const Error: Story = {
  ...Template,
  name: 'Error',
  args: {
    status: 'error',
    errorMessage: 'An error occurred while loading the data.',
  },
};

export const ErrorHasRetryHandler: Story = {
  ...Template,
  name: 'Error with Retry Handler',
  args: {
    status: 'error',
    errorMessage: 'An error occurred while loading the data.',
    onRetry: () => {},
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';

export default {
  component: StatusContent,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof StatusContent>;

const Template: Story = {
  render: (args) => {
    return (
      <StatusContent {...args}>
        <Text text={'hello'} />
      </StatusContent>
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

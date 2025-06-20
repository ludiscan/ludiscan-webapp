import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

import { CreateHeatmapTaskModal } from './CreateHeatmapTaskModal';

import type { Meta, StoryObj } from '@storybook/react';

const queryClient = new QueryClient();

export default {
  component: CreateHeatmapTaskModal,
  controls: { hideNoControlsWarning: true },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} as Meta;
type Story = StoryObj<typeof CreateHeatmapTaskModal>;

const Template: Story = {
  render: (args) => {
    return (
      <CreateHeatmapTaskModal {...args}>
        <Button onClick={() => {}} scheme={'primary'} fontSize={'medium'}>
          <Text text={'Close'} />
        </Button>
      </CreateHeatmapTaskModal>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isOpen: true,
    env: {
      HOSTNAME: 'https://localhost',
      API_BASE_URL: 'https://localhost:8080',
    },
    onClose: () => {
      /* eslint-disable-next-line no-console */
      console.log('onClose');
    },
  },
};

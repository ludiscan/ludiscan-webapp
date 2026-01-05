import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps, createMockService } from '@src/features/heatmap/__storybook__/mockData';
import { PlayerTimeline } from '@src/features/heatmap/menu/PlayerTimeline';

export default {
  component: PlayerTimeline,
  controls: { hideNoControlsWarning: true },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
} as Meta;

type Story = StoryObj<typeof PlayerTimeline>;

const Template: Story = {
  render: (args) => {
    return <PlayerTimeline {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Session)',
  args: createMockMenuProps({
    name: 'timeline',
  }),
};

export const WithSession: Story = {
  ...Template,
  name: 'With Session',
  args: createMockMenuProps({
    name: 'timeline',
    service: createMockService({
      projectId: 12345,
      sessionId: 1,
    }),
  }),
};

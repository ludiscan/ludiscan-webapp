import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps, createMockService } from '@src/features/heatmap/__storybook__/mockData';
import { RouteCoachMenuContent } from '@src/features/heatmap/routecoach/RouteCoachMenuContent';

export default {
  component: RouteCoachMenuContent,
  controls: { hideNoControlsWarning: true },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
} as Meta;

type Story = StoryObj<typeof RouteCoachMenuContent>;

const Template: Story = {
  render: (args) => {
    return <RouteCoachMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Project)',
  args: createMockMenuProps({
    name: 'routecoach',
  }),
};

export const WithProject: Story = {
  ...Template,
  name: 'With Project ID',
  args: createMockMenuProps({
    name: 'routecoach',
    service: createMockService({
      projectId: 12345,
      sessionId: 1,
    }),
  }),
};

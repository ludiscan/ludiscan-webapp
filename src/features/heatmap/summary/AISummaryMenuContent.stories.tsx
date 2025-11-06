import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps, createMockService } from '@src/features/heatmap/__storybook__/mockData';
import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';

export default {
  component: AISummaryMenuContent,
  controls: { hideNoControlsWarning: true },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
} as Meta;

type Story = StoryObj<typeof AISummaryMenuContent>;

const Template: Story = {
  render: (args) => {
    return <AISummaryMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Session)',
  args: createMockMenuProps({
    name: 'aisummary',
  }),
};

export const WithSession: Story = {
  ...Template,
  name: 'With Session ID',
  args: createMockMenuProps({
    name: 'aisummary',
    service: createMockService({
      projectId: 12345,
      sessionId: 1,
    }),
  }),
};

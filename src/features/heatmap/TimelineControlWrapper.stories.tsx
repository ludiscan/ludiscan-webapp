import type { Meta, StoryObj } from '@storybook/nextjs';

import { TimelineControlWrapper } from '@src/features/heatmap/TimelineControlWrapper';

export default {
  component: TimelineControlWrapper,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof TimelineControlWrapper>;

export const Default: Story = {
  render: () => (
    <div>
      <TimelineControlWrapper />
    </div>
  ),
  name: 'Default',
};

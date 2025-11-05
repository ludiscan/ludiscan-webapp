import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps } from '@src/features/heatmap/__storybook__/mockData';
import { HotspotMenuContent } from '@src/features/heatmap/menu/HotspotMenuContent';

export default {
  component: HotspotMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof HotspotMenuContent>;

const Template: Story = {
  render: (args) => {
    return <HotspotMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: createMockMenuProps({
    name: 'hotspot',
  }),
};

import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps } from '@src/features/heatmap/__storybook__/mockData';
import { MoreMenuContent } from '@src/features/heatmap/menu/MoreMenuContent';

export default {
  component: MoreMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof MoreMenuContent>;

const Template: Story = {
  render: (args) => {
    return <MoreMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: createMockMenuProps({
    name: 'more',
  }),
};

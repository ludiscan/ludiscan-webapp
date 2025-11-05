import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps } from '@src/features/heatmap/__storybook__/mockData';
import { GeneralMenuContent } from '@src/features/heatmap/menu/GeneralMenuContent';

export default {
  component: GeneralMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof GeneralMenuContent>;

const Template: Story = {
  render: (args) => {
    return <GeneralMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: createMockMenuProps({
    name: 'general',
  }),
};

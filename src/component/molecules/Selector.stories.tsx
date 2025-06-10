// Slider.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Selector } from '@src/component/molecules/Selector';

export default {
  component: Selector,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Selector>;

const Template: Story = {
  render: (args) => <Selector {...args} />,
};

export const Default: Story = {
  ...Template,
  name: 'Default Selector',
  args: {
    options: ['Option1', 'Option2', 'Option3'],
    onChange: () => {},
  },
};

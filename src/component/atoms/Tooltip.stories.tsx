// Tooltip.stories.tsx
import { Text } from './Text';
import { Tooltip } from './Tooltip';

import type { Meta, StoryObj } from '@storybook/nextjs';

export default {
  component: Tooltip,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Tooltip>;

const Template: Story = {
  render: (args) => {
    return (
      <Tooltip {...args}>
        <Text text={'Hover over me'} />
      </Tooltip>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
  },
};

export const Left: Story = {
  ...Template,
  name: 'Left Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'left',
  },
};

export const Right: Story = {
  ...Template,
  name: 'Right Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'right',
  },
};

export const Bottom: Story = {
  ...Template,
  name: 'Bottom Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'bottom',
  },
};

export const Top: Story = {
  ...Template,
  name: 'Top Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'top',
  },
};

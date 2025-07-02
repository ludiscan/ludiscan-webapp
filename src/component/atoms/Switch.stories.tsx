// Switch.stories.tsx
import { Switch } from './Switch';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  component: Switch,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Switch>;

const Template: Story = {
  render: (args) => (
    <Switch
      {...args}
      onChange={(value) =>
        /* eslint-disable-next-line no-console */
        console.log('Switch toggled:', value)
      }
    />
  ),
};

export const Default: Story = {
  ...Template,
  name: 'Default Switch',
  args: {
    size: 'small',
  },
};

export const Disabled: Story = {
  ...Template,
  name: 'Disabled Switch',
  args: {
    size: 'medium',
    disabled: true,
  },
};

export const DisableChecked: Story = {
  ...Template,
  name: 'Disable & checked Switch',
  args: {
    size: 'medium',
    disabled: true,
    checked: true,
  },
};

export const Small: Story = {
  ...Template,
  name: 'small Switch',
  args: {
    size: 'small',
  },
};

export const Medium: Story = {
  ...Template,
  name: 'medium Switch',
  args: {
    size: 'medium',
  },
};

export const Large: Story = {
  ...Template,
  name: 'large Switch',
  args: {
    size: 'large',
  },
};

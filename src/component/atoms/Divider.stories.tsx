// atoms/Divider.stories.tsx
import { Divider } from './Divider';

import type { Meta, StoryObj } from '@storybook/nextjs';

export default {
  component: Divider,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Divider>;

const Template: Story = {
  render: (args) => {
    return (
      <div style={{ width: '200px', height: '200px' }}>
        <Divider {...args} />
      </div>
    );
  },
};

export const Horizontal: Story = {
  ...Template,
  name: 'Horizontal Divider',
  args: {
    orientation: 'horizontal',
    thickness: '2px',
    margin: '16px 0',
  },
};

export const Vertical: Story = {
  ...Template,
  name: 'Vertical Divider',
  args: {
    orientation: 'vertical',
    thickness: '2px',
    margin: '0 16px',
  },
};

export const CustomColor: Story = {
  ...Template,
  name: 'Custom Color Divider',
  args: {
    orientation: 'horizontal',
    thickness: '2px',
    margin: '16px 0',
    color: '#ff0000',
  },
};

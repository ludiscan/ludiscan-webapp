// TextField.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs';

import { TextField } from '@src/component/molecules/TextField';

export default {
  component: TextField,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof TextField>;

const Template: Story = {
  args: {
    type: 'text',
    placeholder: 'Placeholder',
    fontSize: '18px',
  },
  render: (args) => {
    return <TextField {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default TextField',
  args: {
    ...Template.args,
    type: 'text',
  },
};

export const Password: Story = {
  ...Template,
  name: 'Password TextField',
  args: {
    type: 'password',
  },
};

export const Labeled: Story = {
  ...Template,
  name: 'Labeling TextField',
  args: {
    ...Template.args,
    type: 'text',
    label: 'Label',
  },
};

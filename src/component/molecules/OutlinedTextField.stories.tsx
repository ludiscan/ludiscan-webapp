// TextField.stories.tsx

import type { Meta, StoryObj } from '@storybook/nextjs';

import { OutlinedTextField } from '@src/component/molecules/OutlinedTextField';

export default {
  component: OutlinedTextField,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof OutlinedTextField>;

const Template: Story = {
  args: {
    type: 'text',
    placeholder: 'Placeholder',
  },
  render: (args) => {
    return <OutlinedTextField {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default OutlinedTextField',
  args: {
    ...Template.args,
    type: 'text',
  },
};

export const Labeled: Story = {
  ...Template,
  name: 'Labeled OutlinedTextField',
  args: {
    ...Template.args,
    type: 'text',
    label: 'Label',
  },
};

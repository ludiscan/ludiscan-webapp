import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';

export default {
  component: Toggle,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Toggle>;

const Template: Story = {
  render: (args) => {
    return (
      <Toggle {...args} label={<Text text={'Label'} />}>
        <div>Content</div>
        <div>Content</div>
        <div>Content</div>
      </Toggle>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    onChange: (opened: boolean) => {
      // eslint-disable-next-line no-console
      console.log(opened);
    },
  },
};

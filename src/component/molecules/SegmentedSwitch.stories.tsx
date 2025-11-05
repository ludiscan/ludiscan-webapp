import type { Meta, StoryObj } from '@storybook/nextjs';

import { FlexColumn } from '@src/component/atoms/Flex';
import { SegmentedSwitch } from '@src/component/molecules/SegmentedSwitch';

export default {
  component: SegmentedSwitch,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof SegmentedSwitch>;

const Template: Story = {
  render: (args) => {
    return (
      <FlexColumn gap={16}>
        <SegmentedSwitch {...args} fontSize={'xs'} />
        <SegmentedSwitch {...args} fontSize={'sm'} />
        <SegmentedSwitch {...args} fontSize={'base'} />
        <SegmentedSwitch {...args} fontSize={'lg'} />
        <SegmentedSwitch {...args} fontSize={'xl'} />
        <SegmentedSwitch {...args} fontSize={'2xl'} />
        <SegmentedSwitch {...args} fontSize={'3xl'} />
      </FlexColumn>
    );
  },
};

export const Small: Story = {
  ...Template,
  args: {
    options: ['Option 1', 'Option 2'],
    value: 'Option 1',
    onChange: () => {},
    disabled: false,
  },
};

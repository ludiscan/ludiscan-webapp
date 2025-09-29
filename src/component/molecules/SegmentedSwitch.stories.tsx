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
        <SegmentedSwitch {...args} fontSize={'smallest'} />
        <SegmentedSwitch {...args} fontSize={'small'} />
        <SegmentedSwitch {...args} fontSize={'medium'} />
        <SegmentedSwitch {...args} fontSize={'large1'} />
        <SegmentedSwitch {...args} fontSize={'large2'} />
        <SegmentedSwitch {...args} fontSize={'large3'} />
        <SegmentedSwitch {...args} fontSize={'largest'} />
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

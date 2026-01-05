import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps } from '@src/features/heatmap/__storybook__/mockData';
import { EventLogDetail } from '@src/features/heatmap/menu/EventLogDetail';

export default {
  component: EventLogDetail,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof EventLogDetail>;

const Template: Story = {
  render: (args) => {
    return <EventLogDetail {...args} />;
  },
};

export const Loading: Story = {
  ...Template,
  name: 'Loading State',
  args: createMockMenuProps({
    name: 'eventDetail',
    extra: {
      logName: 'PlayerDeath',
      id: 123,
    },
  }),
};

export const NoData: Story = {
  ...Template,
  name: 'No Data',
  args: createMockMenuProps({
    name: 'eventDetail',
    extra: {},
  }),
};

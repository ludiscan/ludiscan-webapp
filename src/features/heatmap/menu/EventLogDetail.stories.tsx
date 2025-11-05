import type { Meta, StoryObj } from '@storybook/nextjs';

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
  args: {
    model: null,
    name: 'eventLogDetail',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
    extra: {
      logName: 'PlayerDeath',
      id: 123,
    },
  },
};

export const NoData: Story = {
  ...Template,
  name: 'No Data',
  args: {
    model: null,
    name: 'eventLogDetail',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
    extra: {},
  },
};

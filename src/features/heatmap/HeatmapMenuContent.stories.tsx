import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Meta, StoryObj } from '@storybook/react';

import { HeatmapMenuContent } from '@src/features/heatmap/HeatmapMenuContent';

export default {
  component: HeatmapMenuContent,
  controls: {},
} as Meta;

type Story = StoryObj<typeof HeatmapMenuContent>;

const Template: Story = {
  render: (args) => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <HeatmapMenuContent {...args} />
      </QueryClientProvider>
    );
  },
};

export const General: Story = {
  ...Template,
  args: {
    model: null,
    name: 'general',
    toggleMenu: () => {},
    eventLogKeys: ['event1', 'event2', 'event3'],
    handleExportView: async () => {},
    mapOptions: ['Map1', 'Map2', 'Map3'],
    service: {
      isInitialized: false,
      getMapList: async () => [],
      getMapContent: async () => null,
      getGeneralLogKeys: async () => [],
      task: undefined,
      getEventLog: async () => [],
      eventLogs: {},
      projectId: 1,
      sessionId: null,
      setSessionId: () => {},
    },
  },
};

export const Map: Story = {
  ...General,
  args: {
    ...General.args,
    name: 'map',
  },
};

export const EventLog: Story = {
  ...General,
  args: {
    ...General.args,
    name: 'eventlog',
  },
};

export const Hotspot: Story = {
  ...General,
  args: {
    ...General.args,
    name: 'hotspot',
  },
};

export const EventLogDetail: Story = {
  ...General,
  args: {
    ...General.args,
    name: 'eventLogDetail',
  },
};

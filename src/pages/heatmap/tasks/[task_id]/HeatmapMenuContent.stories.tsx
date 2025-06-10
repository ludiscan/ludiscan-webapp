import type { Meta, StoryObj } from '@storybook/react';

import { createMockHeatmapTask } from '@src/modeles/heatmaptask';
import { HeatmapMenuContent } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';

export default {
  component: HeatmapMenuContent,
  controls: {},
} as Meta;

type Story = StoryObj<typeof HeatmapMenuContent>;

const Template: Story = {
  render: (args) => {
    return <HeatmapMenuContent {...args} />;
  },
};

export const General: Story = {
  ...Template,
  args: {
    model: null,
    name: 'general',
    toggleMenu: () => {},
    eventLogKeys: ['event1', 'event2', 'event3'],
    task: createMockHeatmapTask(),
    handleExportView: async () => {},
    mapOptions: ['Map1', 'Map2', 'Map3'],
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
    name: 'eventLog',
  },
};

export const Hotspot: Story = {
  ...General,
  args: {
    ...General.args,
    name: 'hotspot',
  },
};

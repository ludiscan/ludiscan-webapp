import type { Meta, StoryObj } from '@storybook/react';

import { HeatmapIdPageLayout } from '@src/pages/heatmap/projects/[project_id]/index.page';

export default {
  component: HeatmapIdPageLayout,
  controls: {},
} as Meta;

type Story = StoryObj<typeof HeatmapIdPageLayout>;

const Template: Story = {
  render: (args) => {
    return <HeatmapIdPageLayout {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  args: {
    version: 'story',
    service: {
      isInitialized: false,
      getMapList: async () => [],
      getMapContent: async () => null,
      getGeneralLogKeys: async () => [],
      task: undefined,
      getEventLog: async () => [],
      eventLogs: {},
      projectId: 1,
    },
  },
};

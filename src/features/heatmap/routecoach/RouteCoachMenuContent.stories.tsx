import type { Meta, StoryObj } from '@storybook/nextjs';

import { RouteCoachMenuContent } from '@src/features/heatmap/routecoach/RouteCoachMenuContent';
import { mockHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export default {
  component: RouteCoachMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof RouteCoachMenuContent>;

const Template: Story = {
  render: (args) => {
    return <RouteCoachMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Project)',
  args: {
    model: null,
    name: 'routecoach',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: mockHeatmapDataService,
  },
};

export const WithProject: Story = {
  ...Template,
  name: 'With Project ID',
  args: {
    model: null,
    name: 'routecoach',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      ...mockHeatmapDataService,
      projectId: '12345',
      sessionId: 1,
    } as any,
  },
};

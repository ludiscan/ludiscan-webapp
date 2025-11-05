import type { Meta, StoryObj } from '@storybook/nextjs';

import { InfoMenuContent } from '@src/features/heatmap/menu/InfoMenuContent';
import { mockHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export default {
  component: InfoMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof InfoMenuContent>;

const Template: Story = {
  render: (args) => {
    return <InfoMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    model: null,
    name: 'info',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {
      console.log('Export view clicked');
    },
    mapOptions: [],
    service: mockHeatmapDataService,
  },
};

export const WithProjectId: Story = {
  ...Template,
  name: 'With Project ID',
  args: {
    model: null,
    name: 'info',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {
      console.log('Export view clicked');
    },
    mapOptions: [],
    service: {
      ...mockHeatmapDataService,
      projectId: '12345',
    } as any,
  },
};

import type { Meta, StoryObj } from '@storybook/nextjs';

import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';
import { mockHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export default {
  component: AISummaryMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof AISummaryMenuContent>;

const Template: Story = {
  render: (args) => {
    return <AISummaryMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Session)',
  args: {
    model: null,
    name: 'aisummary',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: mockHeatmapDataService,
  },
};

export const WithSession: Story = {
  ...Template,
  name: 'With Session ID',
  args: {
    model: null,
    name: 'aisummary',
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

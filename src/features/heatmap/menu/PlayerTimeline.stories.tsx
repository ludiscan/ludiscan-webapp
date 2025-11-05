import type { Meta, StoryObj } from '@storybook/nextjs';

import { PlayerTimeline } from '@src/features/heatmap/menu/PlayerTimeline';
import { mockHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export default {
  component: PlayerTimeline,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof PlayerTimeline>;

const Template: Story = {
  render: (args) => {
    return <PlayerTimeline {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Session)',
  args: {
    model: null,
    name: 'playerTimeline',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: mockHeatmapDataService,
  },
};

export const WithSession: Story = {
  ...Template,
  name: 'With Session',
  args: {
    model: null,
    name: 'playerTimeline',
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

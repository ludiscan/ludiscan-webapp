import type { Meta, StoryObj } from '@storybook/nextjs';

import { HotspotMenuContent } from '@src/features/heatmap/menu/HotspotMenuContent';

export default {
  component: HotspotMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof HotspotMenuContent>;

const Template: Story = {
  render: (args) => {
    return <HotspotMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    model: null,
    name: 'hotspot',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};

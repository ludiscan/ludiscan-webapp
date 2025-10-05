import type { Meta, StoryObj } from '@storybook/nextjs';

import { HeatmapIdPageLayout } from '@src/pages/heatmap/projects/[project_id]/index.page';
import { useOfflineHeatmapDataService } from '@src/utils/heatmap/useOfflineHeatmapDataService';

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    service: useOfflineHeatmapDataService(null),
  },
};

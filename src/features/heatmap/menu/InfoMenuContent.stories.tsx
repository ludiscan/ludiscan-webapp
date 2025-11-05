import type { Meta, StoryObj } from '@storybook/nextjs';

import { createMockMenuProps, createMockService } from '@src/features/heatmap/__storybook__/mockData';
import { InfoMenuContent } from '@src/features/heatmap/menu/InfoMenuContent';

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
  args: createMockMenuProps({
    name: 'info',
    handleExportView: async () => {
      console.log('Export view clicked');
    },
  }),
};

export const WithProjectId: Story = {
  ...Template,
  name: 'With Project ID',
  args: createMockMenuProps({
    name: 'info',
    handleExportView: async () => {
      console.log('Export view clicked');
    },
    service: createMockService({
      projectId: 12345,
    }),
  }),
};

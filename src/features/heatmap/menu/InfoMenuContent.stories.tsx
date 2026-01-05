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
    handleExportView: async () => {},
  }),
};

export const WithProjectInfo: Story = {
  ...Template,
  name: 'With Project Info',
  args: createMockMenuProps({
    name: 'info',
    handleExportView: async () => {},
    service: createMockService({
      projectId: 12345,
      getProject: async () => ({
        id: 12345,
        name: 'Sample Game Project',
        description: 'A sample project for demonstrating heatmap visualization features.',
        is2D: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
  }),
};

export const WithProject2D: Story = {
  ...Template,
  name: 'With 2D Project',
  args: createMockMenuProps({
    name: 'info',
    handleExportView: async () => {},
    service: createMockService({
      projectId: 99,
      getProject: async () => ({
        id: 99,
        name: '2D Platformer',
        description: '',
        is2D: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
  }),
};

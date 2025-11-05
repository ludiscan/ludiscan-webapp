import type { Meta, StoryObj } from '@storybook/nextjs';
import type { PerformanceMonitorApi } from '@react-three/drei';

import { PerformanceList } from '@src/features/heatmap/PerformanceList';

export default {
  component: PerformanceList,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof PerformanceList>;

const Template: Story = {
  render: (args) => {
    return <PerformanceList {...args} />;
  },
};

const mockApi: PerformanceMonitorApi = {
  fps: 60,
  averages: 60,
  factor: 1,
  refreshrate: 'auto' as const,
  increase: () => {},
  decrease: () => {},
  log: () => {},
};

export const Default: Story = {
  ...Template,
  name: 'Default (60 FPS)',
  args: {
    api: mockApi,
  },
};

export const LowPerformance: Story = {
  ...Template,
  name: 'Low Performance (30 FPS)',
  args: {
    api: {
      ...mockApi,
      fps: 30,
      averages: 32,
      factor: 0.5,
    },
  },
};

export const HighPerformance: Story = {
  ...Template,
  name: 'High Performance (120 FPS)',
  args: {
    api: {
      ...mockApi,
      fps: 120,
      averages: 118,
      factor: 2,
    },
  },
};

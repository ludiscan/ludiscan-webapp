import type { Meta, StoryObj } from '@storybook/nextjs';
import type { Group } from 'three';

import { createMockMenuProps, mockModel } from '@src/features/heatmap/__storybook__/mockData';
import { MapMenuContent } from '@src/features/heatmap/menu/MapMenuContent';

export default {
  component: MapMenuContent,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof MapMenuContent>;

const Template: Story = {
  render: (args) => {
    return <MapMenuContent {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Map Options)',
  args: createMockMenuProps({
    name: 'map',
  }),
};

export const WithMapOptions: Story = {
  ...Template,
  name: 'With Map Options',
  args: createMockMenuProps({
    model: mockModel as unknown as Group,
    name: 'map',
    mapOptions: ['Map1', 'Map2', 'Map3'],
  }),
};

export const WithModelSelected: Story = {
  ...Template,
  name: 'With Model Selected',
  args: createMockMenuProps({
    model: mockModel as unknown as Group,
    name: 'map',
    mapOptions: ['Map1', 'Map2', 'Map3'],
  }),
};

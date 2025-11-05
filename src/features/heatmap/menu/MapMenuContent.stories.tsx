import type { Meta, StoryObj } from '@storybook/nextjs';

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

const mockModel = {
  children: [
    { uuid: '1', name: 'Building1', type: 'obj', visible: true },
    { uuid: '2', name: 'Building2', type: 'gltf', visible: false },
    { uuid: '3', name: 'Tree1', type: 'glb', visible: true },
  ],
};

export const Default: Story = {
  ...Template,
  name: 'Default (No Map Options)',
  args: {
    model: null,
    name: 'map',
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

export const WithMapOptions: Story = {
  ...Template,
  name: 'With Map Options',
  args: {
    model: mockModel as any,
    name: 'map',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: ['Map1', 'Map2', 'Map3'],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};

export const WithModelSelected: Story = {
  ...Template,
  name: 'With Model Selected',
  args: {
    model: mockModel as any,
    name: 'map',
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: ['Map1', 'Map2', 'Map3'],
    service: {
      projectId: '1',
      sessionId: null,
      setSessionId: () => {},
    } as any,
  },
};

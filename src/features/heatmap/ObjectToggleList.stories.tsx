import type { Meta, StoryObj } from '@storybook/nextjs';

import { ObjectToggleList } from '@src/features/heatmap/ObjectToggleList';

export default {
  component: ObjectToggleList,
  controls: { hideNoControlsWarning: true },
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} as Meta;
type Story = StoryObj<typeof ObjectToggleList>;

const Template: Story = {
  render: (args) => {
    return <ObjectToggleList {...args} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default (3 objects)',
  args: {
    mapName: 'test-map',
    model: {
      name: 'BuildingModel',
      children: [
        { uuid: '1', name: 'Floor', type: 'Mesh', visible: true },
        { uuid: '2', name: 'Walls', type: 'Mesh', visible: true },
        { uuid: '3', name: 'Roof', type: 'Mesh', visible: true },
      ],
    },
  },
};

export const ManyObjects: Story = {
  ...Template,
  name: 'Many Objects',
  args: {
    mapName: 'complex-map',
    model: {
      name: 'ComplexScene',
      children: [
        { uuid: '1', name: 'Ground', type: 'Mesh', visible: true },
        { uuid: '2', name: 'Building_A', type: 'Mesh', visible: true },
        { uuid: '3', name: 'Building_B', type: 'Mesh', visible: false },
        { uuid: '4', name: 'Trees', type: 'Group', visible: true },
        { uuid: '5', name: 'Vehicles', type: 'Group', visible: true },
        { uuid: '6', name: 'Props', type: 'Mesh', visible: false },
        { uuid: '7', name: 'Lights', type: 'Light', visible: true },
        { uuid: '8', name: 'Skybox', type: 'Mesh', visible: true },
      ],
    },
  },
};

export const LongNames: Story = {
  ...Template,
  name: 'Long Object Names',
  args: {
    mapName: 'truncation-test',
    model: {
      name: 'VeryLongModelNameThatShouldTruncate',
      children: [
        { uuid: '1', name: 'ExtremelyLongObjectName_Floor_Section_01', type: 'Mesh', visible: true },
        { uuid: '2', name: 'AnotherVeryLongName_Collision', type: 'Mesh', visible: true },
        { uuid: '3', name: 'Short', type: 'Mesh', visible: true },
      ],
    },
  },
};

export const NoModelName: Story = {
  ...Template,
  name: 'No Model Name',
  args: {
    mapName: 'unnamed',
    model: {
      children: [
        { uuid: '1', name: 'Object1', type: 'Mesh', visible: true },
        { uuid: '2', name: 'Object2', type: 'Mesh', visible: true },
      ],
    },
  },
};

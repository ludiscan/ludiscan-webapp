import { useState } from 'react';

import { DraggableNumberInput } from './DraggableNumberInput';

import type { Meta, StoryObj } from '@storybook/react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';

const meta: Meta<typeof DraggableNumberInput> = {
  title: 'Atoms/DraggableNumberInput',
  component: DraggableNumberInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'number',
      description: 'Current value',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    sensitivity: {
      control: 'number',
      description: 'Drag sensitivity multiplier',
    },
    precision: {
      control: 'number',
      description: 'Decimal precision',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    label: {
      control: 'text',
      description: 'Optional label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DraggableNumberInput>;

const Template = (args: React.ComponentProps<typeof DraggableNumberInput>) => {
  const [value, setValue] = useState(args.value);
  return <DraggableNumberInput {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: Template,
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    sensitivity: 0.5,
  },
};

export const WithLabel: Story = {
  render: Template,
  args: {
    value: 0,
    min: -180,
    max: 180,
    step: 1,
    label: 'Rotation',
  },
};

export const FloatPrecision: Story = {
  render: Template,
  args: {
    value: 1.5,
    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    sensitivity: 0.1,
    label: 'Scale',
  },
};

export const HighPrecision: Story = {
  render: Template,
  args: {
    value: 0.005,
    min: 0,
    max: 1,
    step: 0.001,
    precision: 3,
    sensitivity: 0.01,
    label: 'Opacity',
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    value: 42,
    disabled: true,
    label: 'Locked',
  },
};

export const UnboundedRange: Story = {
  render: Template,
  args: {
    value: 0,
    step: 1,
    label: 'Position',
  },
};

const UnityInspectorStyleComponent = () => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1, z: 1 });

  return (
    <FlexColumn gap={12} style={{ padding: 16, background: '#2d2d2d', borderRadius: 8, minWidth: 300 }}>
      <Text text='Transform' fontSize='14px' fontWeight='bold' />

      <FlexRow gap={8} align='center'>
        <Text text='Position' fontSize='12px' style={{ width: 60 }} />
        <DraggableNumberInput label='X' value={position.x} onChange={(v) => setPosition((p) => ({ ...p, x: v }))} step={0.1} precision={2} />
        <DraggableNumberInput label='Y' value={position.y} onChange={(v) => setPosition((p) => ({ ...p, y: v }))} step={0.1} precision={2} />
        <DraggableNumberInput label='Z' value={position.z} onChange={(v) => setPosition((p) => ({ ...p, z: v }))} step={0.1} precision={2} />
      </FlexRow>

      <FlexRow gap={8} align='center'>
        <Text text='Rotation' fontSize='12px' style={{ width: 60 }} />
        <DraggableNumberInput label='X' value={rotation.x} onChange={(v) => setRotation((r) => ({ ...r, x: v }))} min={-360} max={360} step={1} precision={0} />
        <DraggableNumberInput label='Y' value={rotation.y} onChange={(v) => setRotation((r) => ({ ...r, y: v }))} min={-360} max={360} step={1} precision={0} />
        <DraggableNumberInput label='Z' value={rotation.z} onChange={(v) => setRotation((r) => ({ ...r, z: v }))} min={-360} max={360} step={1} precision={0} />
      </FlexRow>

      <FlexRow gap={8} align='center'>
        <Text text='Scale' fontSize='12px' style={{ width: 60 }} />
        <DraggableNumberInput
          label='X'
          value={scale.x}
          onChange={(v) => setScale((s) => ({ ...s, x: v }))}
          min={0.01}
          step={0.1}
          precision={2}
          sensitivity={0.1}
        />
        <DraggableNumberInput
          label='Y'
          value={scale.y}
          onChange={(v) => setScale((s) => ({ ...s, y: v }))}
          min={0.01}
          step={0.1}
          precision={2}
          sensitivity={0.1}
        />
        <DraggableNumberInput
          label='Z'
          value={scale.z}
          onChange={(v) => setScale((s) => ({ ...s, z: v }))}
          min={0.01}
          step={0.1}
          precision={2}
          sensitivity={0.1}
        />
      </FlexRow>
    </FlexColumn>
  );
};

export const UnityInspectorStyle: Story = {
  render: UnityInspectorStyleComponent,
};

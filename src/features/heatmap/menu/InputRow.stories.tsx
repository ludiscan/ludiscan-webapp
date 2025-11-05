import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '@src/component/atoms/Button';
import { Slider } from '@src/component/atoms/Slider';
import { Switch } from '@src/component/atoms/Switch';
import { InputColumn, InputRow } from '@src/features/heatmap/menu/InputRow';

export default {
  component: InputRow,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof InputRow>;

const Template: Story = {
  render: (args) => {
    return <InputRow {...args} />;
  },
};

export const WithSwitch: Story = {
  ...Template,
  name: 'With Switch',
  args: {
    label: 'Show Heatmap',
    children: <Switch label="Toggle" checked={true} onChange={() => {}} size="small" />,
  },
};

export const WithSlider: Story = {
  ...Template,
  name: 'With Slider',
  args: {
    label: 'Opacity',
    children: <Slider value={0.5} min={0} max={1} step={0.1} onChange={() => {}} textField />,
  },
};

export const WithButton: Story = {
  ...Template,
  name: 'With Button',
  args: {
    label: 'Action',
    children: (
      <Button onClick={() => {}} scheme="primary" fontSize="sm">
        Apply
      </Button>
    ),
  },
};

export const AlignTop: Story = {
  ...Template,
  name: 'Align Top',
  args: {
    label: 'Description',
    align: 'flex-start',
    children: (
      <div>
        <p>This is a long description that demonstrates top alignment of the label.</p>
        <p>Multiple lines of content can be displayed.</p>
      </div>
    ),
  },
};

// InputColumn stories
const ColumnTemplate: StoryObj<typeof InputColumn> = {
  render: (args) => {
    return <InputColumn {...args} />;
  },
};

export const ColumnWithSlider: typeof ColumnTemplate = {
  ...ColumnTemplate,
  name: 'Column: With Slider',
  args: {
    label: 'Block Size',
    children: <Slider value={250} min={50} max={500} step={50} onChange={() => {}} textField />,
  },
};

export const ColumnWithSwitch: typeof ColumnTemplate = {
  ...ColumnTemplate,
  name: 'Column: With Switch',
  args: {
    label: 'Enable Feature',
    children: <Switch label="Toggle" checked={false} onChange={() => {}} size="small" />,
  },
};

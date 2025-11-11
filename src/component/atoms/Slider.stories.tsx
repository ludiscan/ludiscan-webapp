// Slider.stories.tsx
import { Slider } from './Slider';
import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/nextjs';

export default {
  component: Slider,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Slider>;

const Template: Story = {
  render: (args) => (
    <div style={{ width: '300px', padding: '16px' }}>
      <Slider
        {...args}
        onChange={(value) => {
          /* eslint-disable-next-line no-console */
          console.log('Slider value:', value);
        }}
      />
      <Text text={`Value: ${args.value}`} />
    </div>
  ),
};

export const Default: Story = {
  ...Template,
  name: 'Default Slider',
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
};

export const Disabled: Story = {
  ...Template,
  name: 'Disabled Slider',
  args: {
    value: 30,
    min: 0,
    max: 100,
    step: 1,
    disabled: true,
  },
};

export const DarkThemeSlider: Story = {
  ...Template,
  name: 'Dark Theme Slider',
  args: {
    value: 70,
    min: 0,
    max: 100,
    step: 1,
  },
};

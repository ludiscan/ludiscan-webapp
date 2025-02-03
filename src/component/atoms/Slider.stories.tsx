// Slider.stories.tsx
import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import { Slider } from './Slider.tsx';
import { Text } from './Text.tsx';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  component: Slider,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Slider>;

const Template: Story = {
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
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
    </SharedThemeProvider>
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

// Slider.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Selector } from '@src/component/atoms/Selector';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

export default {
  component: Selector,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Selector>;

const Template: Story = {
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
      <Selector {...args} />
    </SharedThemeProvider>
  ),
};

export const Default: Story = {
  ...Template,
  name: 'Default Selector',
  args: {
    options: ['Option1', 'Option2', 'Option3'],
  },
};

// Switch.stories.tsx
import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import { Switch } from './Switch.tsx';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  component: Switch,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Switch>;

const Template: Story = {
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
      <Switch
        {...args}
        onChange={(value) => console.log('Switch toggled:', value)}
      />
    </SharedThemeProvider>
  ),
};

export const Default: Story = {
  ...Template,
  name: 'Default Switch',
  args: {
  },
};

export const Checked: Story = {
  ...Template,
  name: 'Checked Switch',
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  ...Template,
  name: 'Disabled Switch',
  args: {
    checked: false,
    disabled: true,
  },
};

export const DarkThemeSwitch: Story = {
  ...Template,
  name: 'Dark Theme Switch',
  args: {
    checked: true,
  },
};

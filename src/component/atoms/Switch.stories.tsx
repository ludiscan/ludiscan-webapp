// Switch.stories.tsx
import { Switch } from './Switch';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

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
        onChange={(value) =>
          /* eslint-disable-next-line no-console */
          console.log('Switch toggled:', value)
        }
      />
    </SharedThemeProvider>
  ),
};

export const Default: Story = {
  ...Template,
  name: 'Default Switch',
  args: {},
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

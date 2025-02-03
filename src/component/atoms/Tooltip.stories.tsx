// Tooltip.stories.tsx
import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import { Text } from './Text.tsx';
import { Tooltip } from './Tooltip.tsx';

import type { Meta, StoryObj } from '@storybook/react';

export default {
  component: Tooltip,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Tooltip>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Tooltip {...args} >
          <Text text={'Hover over me'} />
        </Tooltip>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
  },
};

export const Left: Story = {
  ...Template,
  name: 'Left Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'left',
  },
};

export const Right: Story = {
  ...Template,
  name: 'Right Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'right',
  },
};

export const Bottom: Story = {
  ...Template,
  name: 'Bottom Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'bottom',
  },
};

export const Top: Story = {
  ...Template,
  name: 'Top Tooltip',
  args: {
    tooltip: 'This is a tooltip message',
    placement: 'top',
  },
};


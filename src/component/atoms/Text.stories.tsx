import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import { Text } from './Text.tsx';

import type { Meta, StoryObj } from '@storybook/react';

import { colors, fontSizes } from '@/styles/style.ts';

export default {
  component: Text,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Text>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Text {...args} />
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    text: 'Plain Text',
  },
};

export const Smallest: Story = {
  ...Template,
  name: 'font smallest style',
  args: {
    text: 'Smallest Text',
    fontSize: fontSizes.smallest,
  },
};

export const Largest: Story = {
  ...Template,
  name: 'font largest style',
  args: {
    text: 'Largest Text',
    fontSize: fontSizes.largest,
  },
};

export const PrimaryColor: Story = {
  ...Template,
  name: 'color primary style',
  args: {
    text: 'Primary Color Text',
    color: colors.primary,
  },
};

export const SecondaryColor: Story = {
  ...Template,
  name: 'color secondary style',
  args: {
    text: 'Secondary Color Text',
    color: colors.stone05,
  },
};

export const Shadow: Story = {
  ...Template,
  name: 'shadow style',
  args: {
    text: 'Shadow Text',
    shadow: true,
  },
};

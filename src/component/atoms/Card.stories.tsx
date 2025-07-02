import { Card } from './Card';
import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';
import { colors } from '@src/styles/style';

export default {
  component: Card,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Card>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Card {...args}>
          <Text text={'Plain Text'} />
        </Card>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {},
};

export const ShadowSmall: Story = {
  ...Template,
  name: 'shadow small style',
  args: {
    shadow: 'small',
  },
};

export const ShadowMedium: Story = {
  ...Template,
  name: 'shadow medium style',
  args: {
    shadow: 'medium',
  },
};

export const ShadowLarge: Story = {
  ...Template,
  name: 'shadow large style',
  args: {
    shadow: 'large',
  },
};

export const SurfaceColor: Story = {
  ...Template,
  name: 'surface style',
  args: {
    color: colors.neutral01,
  },
};

export const PrimaryColor: Story = {
  ...Template,
  name: 'primary style',
  args: {
    color: colors.primary,
  },
};

export const Blur: Story = {
  ...Template,
  name: 'blur style',
  args: {
    blur: true,
    color: colors.primary,
  },
};

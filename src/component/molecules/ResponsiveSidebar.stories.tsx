import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@/component/atoms/Text.tsx';
import { ResponsiveSidebar } from '@/component/molecules/ResponsiveSidebar.tsx';
import { SharedThemeProvider } from '@/hooks/useSharedTheme.tsx';
import darkTheme from '@/styles/dark.ts';
import lightTheme from '@/styles/light.ts';

export default {
  component: ResponsiveSidebar,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof ResponsiveSidebar>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <ResponsiveSidebar>
          <Text text={'Hover over me'} />
        </ResponsiveSidebar>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default ResponsiveSidebar',
};

import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

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

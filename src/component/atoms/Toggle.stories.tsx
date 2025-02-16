import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '@/component/atoms/Text.tsx';
import { Toggle } from '@/component/atoms/Toggle.tsx';

export default {
  component: Toggle,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Toggle>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Toggle {...args} label={<Text text={'Label'} />}>
          <div>Content</div>
          <div>Content</div>
          <div>Content</div>
        </Toggle>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    onChange: (opened: boolean) => {
      // eslint-disable-next-line no-console
      console.log(opened);
    },
  },
};

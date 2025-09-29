import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

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

// TextField.stories.tsx
import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import type { Meta, StoryObj } from '@storybook/react';

import { OutlinedTextField } from '@/component/molecules/OutlinedTextField.tsx';

export default {
  component: OutlinedTextField,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof OutlinedTextField>;

const Template: Story = {
  args: {
    type: 'text',
    placeholder: 'Placeholder',
  },
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <OutlinedTextField {...args} />
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default OutlinedTextField',
  args: {
    ...Template.args,
    type: 'text',
  },
};

export const Labeled: Story = {
  ...Template,
  name: 'Labeled OutlinedTextField',
  args: {
    ...Template.args,
    type: 'text',
    label: 'Label',
  },
};

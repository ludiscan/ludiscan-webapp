// TextField.stories.tsx
import darkTheme from '../../styles/dark';
import lightTheme from '../../styles/light';

import type { Meta, StoryObj } from '@storybook/react';

import { TextField } from '@src/component/molecules/TextField';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';

export default {
  component: TextField,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof TextField>;

const Template: Story = {
  args: {
    type: 'text',
    placeholder: 'Placeholder',
    fontSize: '18px',
  },
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <TextField {...args} />
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default TextField',
  args: {
    ...Template.args,
    type: 'text',
  },
};

export const Password: Story = {
  ...Template,
  name: 'Password TextField',
  args: {
    type: 'password',
  },
};

export const Labeled: Story = {
  ...Template,
  name: 'Labeling TextField',
  args: {
    ...Template.args,
    type: 'text',
    label: 'Label',
  },
};

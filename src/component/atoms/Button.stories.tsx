import { SharedThemeProvider } from '../../hooks/useSharedTheme.tsx';
import darkTheme from '../../styles/dark.ts';
import lightTheme from '../../styles/light.ts';

import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Button {...args}>Plain Text</Button>
      </SharedThemeProvider>
    );
  },
};

export const Primary: Story = {
  ...Template,
  name: 'primary style',
  args: {
    scheme: 'primary',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimarySmall: Story = {
  ...Template,
  name: 'primary style small',
  args: {
    scheme: 'primary',
    fontSize: 'small',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge: Story = {
  ...Template,
  name: 'primary style large',
  args: {
    scheme: 'primary',
    fontSize: 'large',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryFillLarge: Story = {
  ...Template,
  name: 'primary style fill',
  args: {
    scheme: 'primary',
    fontSize: 'medium',
    width: 'full',
    onClick: () => {
      alert('click');
    },
  },
};

export const Surface: Story = {
  ...Template,
  name: 'surface style',
  args: {
    scheme: 'surface',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

export const Warning: Story = {
  ...Template,
  name: 'warning style',
  args: {
    scheme: 'warning',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

export const None: Story = {
  ...Template,
  name: 'none style',
  args: {
    scheme: 'none',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

export const Error: Story = {
  ...Template,
  name: 'error style',
  args: {
    scheme: 'error',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

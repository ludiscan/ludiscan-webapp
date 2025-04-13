import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

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

export const PrimarySmallest: Story = {
  ...Template,
  name: 'primary style smallest',
  args: {
    scheme: 'primary',
    fontSize: 'smallest',
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

export const PrimaryMedium: Story = {
  ...Template,
  name: 'primary style medium',
  args: {
    scheme: 'primary',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge1: Story = {
  ...Template,
  name: 'primary style large1',
  args: {
    scheme: 'primary',
    fontSize: 'large1',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge2: Story = {
  ...Template,
  name: 'primary style large2',
  args: {
    scheme: 'primary',
    fontSize: 'large2',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge3: Story = {
  ...Template,
  name: 'primary style large3',
  args: {
    scheme: 'primary',
    fontSize: 'large3',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLargest: Story = {
  ...Template,
  name: 'primary style largest',
  args: {
    scheme: 'primary',
    fontSize: 'largest',
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

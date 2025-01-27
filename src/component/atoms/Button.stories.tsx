import { ThemeProvider } from '@emotion/react';

import lightTheme from '../../styles/light.ts';

import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,

};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  name: 'primary style',
  args: {
    scheme: 'primary',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const PrimarySmall: Story = {
  name: 'primary style small',
  args: {
    scheme: 'primary',
    fontSize: 'small',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const PrimaryLarge: Story = {
  name: 'primary style large',
  args: {
    scheme: 'primary',
    fontSize: 'large',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const PrimaryFillLarge: Story = {
  name: 'primary style fill',
  args: {
    scheme: 'primary',
    fontSize: 'medium',
    width: 'full',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const Surface: Story = {
  name: 'surface style',
  args: {
    scheme: 'surface',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const Warning: Story = {
  name: 'warning style',
  args: {
    scheme: 'warning',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const None: Story = {
  name: 'none style',
  args: {
    scheme: 'none',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

export const Error: Story = {
  name: 'error style',
  args: {
    scheme: 'error',
    fontSize: 'medium',
    onClick: () => {
      alert('click');
    },
  },
  render: (args) => {
    return (
      <ThemeProvider theme={lightTheme}>
        <Button {...args}>Plain Text</Button>
      </ThemeProvider>
    );
  }
};

import { BiCircle } from 'react-icons/bi';

import { Button } from './Button';

import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

const Template: Story = {
  render: (args) => {
    return (
      <div>
        <Button {...args} radius={'small'}>
          <BiCircle />
          Plain Text
        </Button>
        <Button {...args} radius={'default'}>
          <BiCircle />
          Plain Text
        </Button>
      </div>
    );
  },
};

export const Primary: Story = {
  ...Template,
  name: 'primary base style',
  args: {
    scheme: 'primary',
    fontSize: 'base',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimarySmallest: Story = {
  ...Template,
  name: 'primary style xs',
  args: {
    scheme: 'primary',
    fontSize: 'xs',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimarySmall: Story = {
  ...Template,
  name: 'primary style sm',
  args: {
    scheme: 'primary',
    fontSize: 'sm',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryMedium: Story = {
  ...Template,
  name: 'primary style lg',
  args: {
    scheme: 'primary',
    fontSize: 'lg',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge1: Story = {
  ...Template,
  name: 'primary style xl',
  args: {
    scheme: 'primary',
    fontSize: 'xl',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge2: Story = {
  ...Template,
  name: 'primary style 2xl',
  args: {
    scheme: 'primary',
    fontSize: '2xl',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLarge3: Story = {
  ...Template,
  name: 'primary style 3xl',
  args: {
    scheme: 'primary',
    fontSize: '3xl',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLargest: Story = {
  ...Template,
  name: 'primary style 4xl',
  args: {
    scheme: 'primary',
    fontSize: '4xl',
    onClick: () => {
      alert('click');
    },
  },
};

export const PrimaryLargest2: Story = {
  ...Template,
  name: 'primary style 5xl',
  args: {
    scheme: 'primary',
    fontSize: '5xl',
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
    fontSize: 'base',
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
    fontSize: 'base',
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
    fontSize: 'base',
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
    fontSize: 'base',
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
    fontSize: 'base',
    onClick: () => {
      alert('click');
    },
  },
};

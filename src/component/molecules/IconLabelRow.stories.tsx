import { IoCut } from 'react-icons/io5';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { IconLabelRow } from '@src/component/molecules/IconLabelRow';

export default {
  component: IconLabelRow,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof IconLabelRow>;
const Template: Story = {
  render: (args) => {
    return (
      <div style={{ border: '1px solid #ccc', width: '300px' }}>
        <IconLabelRow {...args} />
      </div>
    );
  },
};

export const DefaultButton: Story = {
  ...Template,
  name: 'default button style',
  args: {
    icon: <IoCut />,
    label: 'Cut',
    onClick: () => {
      /* eslint-disable-next-line no-console */
      console.log('IconLabelRow clicked');
    },
  },
};

export const DefaultLink: Story = {
  ...Template,
  name: 'default link style',
  args: {
    icon: <IoCut />,
    label: 'Cut',
    href: 'https://example.com',
    target: '_blank',
  },
};
